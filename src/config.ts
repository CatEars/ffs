let storeRoot: string | undefined = undefined;
let noSec: boolean = false;
let usersFilePath: string | undefined = undefined;

type Config = {
  storeRoot: string;
  usersFilePath: string;
};

export function getStoreRoot() {
  if (!storeRoot) {
    throw new Error(`STORE ROOT NOT SET!`);
  }
  return storeRoot;
}

export function getUsersFilePath() {
  if (!usersFilePath) {
    throw new Error(`USERS FILE PATH NOT SET!`);
  }
  return usersFilePath;
}

export function shouldAbandonSecurity() {
  return noSec;
}

export function unsecure() {
  noSec = true;
}

export function setConfig(config: Config) {
  storeRoot = config.storeRoot;
  usersFilePath = config.usersFilePath;
}

export function validateConfig() {
  getStoreRoot();
  getUsersFilePath();
}
