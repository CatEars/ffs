import { logger } from './logging/logger.ts';

let noSec: boolean = false;
export const viewPath = Deno.cwd() + '/src/website/views/';
export const devModeEnabled = Deno.env.get('FFS_ENV') === 'dev';
export const storeRootKey = 'FFS_STORE_ROOT';
export const cacheRootKey = 'FFS_CACHE_ROOT';
export const usersFileKey = 'FFS_USERS_FILE';
export const requestLogsKey = 'FFS_REQUEST_LOGS_FILE';
export const customCommandsFileKey = 'FFS_CUSTOM_COMMANDS_FILE';
export const instanceSecretKey = 'FFS_INSTANCE_SECRET';

type Config = {
    storeRoot: string;
    usersFilePath: string;
    cacheRoot: string;
    requestLogsFile: string;
    customCommandsFile: string;
    instanceSecret: string;
};

function getEnvValueOrThrow(key: string) {
    const value = Deno.env.get(key);
    if (!value) {
        throw new Error(`${key} not set!`);
    }
    return value;
}

export function getStoreRoot() {
    return getEnvValueOrThrow(storeRootKey);
}

export function getUsersFilePath() {
    return getEnvValueOrThrow(usersFileKey);
}

export function getCacheRoot() {
    return getEnvValueOrThrow(cacheRootKey);
}

export function getRequestLogsFile() {
    return getEnvValueOrThrow(requestLogsKey);
}

export function getCustomCommandsFile() {
    return Deno.env.get(customCommandsFileKey) || '';
}

const featuresThatDependOnInstanceSecret: string[] = [];
let _instanceSecret: string | null = null;
export function getInstanceSecret() {
    if (_instanceSecret) {
        return _instanceSecret;
    } else {
        _instanceSecret = Deno.env.get(instanceSecretKey) || null;
        if (!_instanceSecret) {
            logger.warn(`Instance secret (${instanceSecretKey}) not set, 
        The following features will not work between restarts: [${
                featuresThatDependOnInstanceSecret.join(', ')
            }]`);
            _instanceSecret = crypto.randomUUID();
        }
    }
    return _instanceSecret;
}

export function shouldAbandonSecurity() {
    return noSec;
}

export function unsecure() {
    noSec = true;
}

export function setConfig(config: Config) {
    Deno.env.set(storeRootKey, config.storeRoot);
    Deno.env.set(cacheRootKey, config.cacheRoot);
    Deno.env.set(usersFileKey, config.usersFilePath);
    Deno.env.set(requestLogsKey, config.requestLogsFile);
    Deno.env.set(customCommandsFileKey, config.customCommandsFile);
    Deno.env.set(instanceSecretKey, config.instanceSecret);
}

export function validateConfig() {
    getStoreRoot();
    getUsersFilePath();
    getCacheRoot();
    getRequestLogsFile();
    getInstanceSecret();
}
