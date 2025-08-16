import { encodeBase64 } from 'jsr:@std/encoding@1/base64';
import { getUsersFilePath } from '../config.ts';
import { pbkdf2Hash } from './password-hash.ts';
import { UserConfig } from '../user-config/index.ts';

type BaseAuth = {
    username: string;
    config?: UserConfig;
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

let hasReadUsersFile = false;
const knownUsers: UserAuth[] = [];
const instanceSalt = new Uint8Array(32);
crypto.getRandomValues(instanceSalt);
const instanceUserHashes = new Map<string, string>();

async function calculateUserHash(user: UserAuth, apiKey: string): Promise<string> {
    const key = encodeBase64(user.username) + ':' + encodeBase64(apiKey);
    const salt = instanceSalt;
    const keyBytes = new TextEncoder().encode(key);
    const combinedBytes = new Uint8Array(salt.length + keyBytes.length);
    combinedBytes.set(salt, 0);
    combinedBytes.set(keyBytes, salt.length);
    const hashBuffer = await crypto.subtle.digest('SHA-256', combinedBytes);
    return encodeBase64(hashBuffer);
}

async function deriveApiKey(user: UserAuth) {
    const hashedKey = await calculateUserHash(user, user.key);
    instanceUserHashes.set(hashedKey, user.username);
    return hashedKey;
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

export function getUserMatchingApiKey(apiKey: string) {
    ensureUsersFileRead();
    const userMatchingKey = instanceUserHashes.get(apiKey);
    if (!userMatchingKey) {
        return;
    }
    for (const user of knownUsers) {
        if (user.username === userMatchingKey) {
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

export function resetSecuritySaltEveryTwentyFiveHours() {
    setInterval(() => {
        crypto.getRandomValues(instanceSalt);
    }, 1000 * 60 * 60 * 25);
}
