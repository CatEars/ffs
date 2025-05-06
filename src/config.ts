export const testApiKey = "bab5b6be-2aad-11f0-a2ca-3b8bfdd0a613";

let storeRoot: string | undefined = undefined;
let apiKey: string | undefined = undefined;
let noSec: boolean = false;

type Config = {
  storeRoot: string;
  apiKey: string;
};

export function getStoreRoot() {
  if (!storeRoot) {
    throw new Error(`STORE ROOT NOT SET!`);
  }
  return storeRoot;
}

export function getApiKey() {
  if (!apiKey) {
    throw new Error(`API KEY NOT SET!`);
  }
  return apiKey;
}

export function shouldAbandonSecurity() {
  return noSec;
}

export function unsecure() {
  noSec = true;
}

export function setConfig(config: Config) {
  storeRoot = config.storeRoot;
  apiKey = config.apiKey;
}

export function validateConfig() {
  getStoreRoot();
  getApiKey();
}
