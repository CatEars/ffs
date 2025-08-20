import { getUsersFilePath } from '../config.ts';
import { pbkdf2Hash } from './password-hash.ts';
import { UserConfig } from '../application-state.ts';
import { ResourceManager } from './resources.ts';
import { signAndUrlEncodeClaims, verifyAndUrlDecodeClaims } from './claims.ts';

type BaseAuth = {
    username: string;
    config?: Partial<UserConfig>;
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

const userResourceManager = new ResourceManager('users');

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

    hasReadUsersFile = true;
}

function pbkdf2Compare(user: Pbkdf2Auth, password: string) {
    const result = pbkdf2Hash(password, user.salt);
    return user.b64Hash === result;
}
