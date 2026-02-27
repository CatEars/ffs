import { getUsersFilePath } from '../config.ts';
import { pbkdf2Hash } from './password-hash.ts';
import { UserPermissions } from '../application-state.ts';
import { ResourceManager } from './resources.ts';
import { signAndUrlEncodeClaims, verifyAndUrlDecodeClaims } from './claims.ts';
import { getCreatedUsersDir } from '../files/cache-folder.ts';
import { join } from '@std/path';
import { ensureDir } from '@std/fs/ensure-dir';

type BaseAuth = {
    username: string;
    permissions?: Partial<UserPermissions>;
};

type InsecureBasicAuth = BaseAuth & {
    type: 'insecure-basic_auth';
    password: string;
    key: string;
};

type Pbkdf2Auth = BaseAuth & {
    type: 'pbkdf2';
    salt: string;
    b64Hash: string;
    key: string;
};

export type UserAuth = Pbkdf2Auth | InsecureBasicAuth;

const userResourceManager = new ResourceManager('user');

let hasReadUsersFile = false;
const knownUsers: UserAuth[] = [];

async function deriveApiKey(user: UserAuth) {
    const userClaim = userResourceManager.nameForResource(user.username);
    return await signAndUrlEncodeClaims([userClaim]);
}

export function getMatchingUser(
    username: string,
    password: string,
): Promise<string | undefined> {
    ensureUsersFileRead();
    for (const user of knownUsers) {
        if (
            user.type === 'insecure-basic_auth' &&
            user.username === username &&
            user.password === password
        ) {
            return deriveApiKey(user);
        } else if (
            user.type === 'pbkdf2' &&
            user.username === username &&
            pbkdf2Compare(user, password)
        ) {
            return deriveApiKey(user);
        }
    }
    return Promise.resolve(undefined);
}

export async function getUserMatchingApiKey(apiKey: string) {
    ensureUsersFileRead();
    const validatedKey = await verifyAndUrlDecodeClaims(apiKey);
    if (!validatedKey) {
        return;
    }
    for (const user of knownUsers) {
        const resourceName = userResourceManager.nameForResource(user.username);
        if (userResourceManager.mayAccess(validatedKey, resourceName)) {
            return user;
        }
    }
}

function ensureUsersFileRead() {
    if (hasReadUsersFile) {
        return;
    }

    const usersFilePath = getUsersFilePath();
    const bytes = Deno.readFileSync(usersFilePath);
    const userData = JSON.parse(new TextDecoder().decode(bytes));
    for (const user of userData) {
        if (user.type === 'insecure-basic_auth') {
            knownUsers.push(user as InsecureBasicAuth);
        } else if (user.type === 'pbkdf2') {
            knownUsers.push(user as Pbkdf2Auth);
        }
    }

    loadUsersFromCacheDir();

    hasReadUsersFile = true;
}

function loadUsersFromCacheDir() {
    try {
        const usersDir = getCreatedUsersDir();
        for (const entry of Deno.readDirSync(usersDir)) {
            if (entry.isFile && entry.name.endsWith('.json')) {
                try {
                    const bytes = Deno.readFileSync(join(usersDir, entry.name));
                    const user = JSON.parse(new TextDecoder().decode(bytes));
                    if (user.type === 'pbkdf2') {
                        knownUsers.push(user as Pbkdf2Auth);
                    } else if (user.type === 'insecure-basic_auth') {
                        knownUsers.push(user as InsecureBasicAuth);
                    }
                } catch {
                    // Intentionally left empty
                }
            }
        }
    } catch {
        // Intentionally left empty
    }
}

export async function createUserInCacheDir(username: string, password: string): Promise<void> {
    ensureUsersFileRead();

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
    }

    if (knownUsers.some((u) => u.username === username)) {
        throw new Error(`User '${username}' already exists`);
    }

    const salt = crypto.randomUUID();
    const b64Hash = pbkdf2Hash(password, salt);
    const key = crypto.randomUUID();

    const newUser: Pbkdf2Auth = {
        type: 'pbkdf2',
        username,
        b64Hash,
        salt,
        key,
    };

    const usersDir = getCreatedUsersDir();
    await ensureDir(usersDir);
    const filePath = join(usersDir, `${username}.json`);
    await Deno.writeTextFile(filePath, JSON.stringify(newUser, null, 4));

    knownUsers.push(newUser);
}

function pbkdf2Compare(user: Pbkdf2Auth, password: string) {
    const result = pbkdf2Hash(password, user.salt);
    return user.b64Hash === result;
}
