let noSec: boolean = false;
export const viewPath = Deno.cwd() + "/src/website/views/";
export const devModeEnabled = Deno.env.get("FFS_ENV") === "dev";
export const storeRootKey = "FFS_STORE_ROOT";
export const cacheRootKey = "FFS_CACHE_ROOT";
export const usersFileKey = "FFS_USERS_FILE";

type Config = {
  storeRoot: string;
  usersFilePath: string;
  cacheRoot: string;
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
}

export function validateConfig() {
  getStoreRoot();
  getUsersFilePath();
  getCacheRoot();
}
