import { getUsersFilePath } from "../config.ts";
import { pbkdf2Hash } from "./password-hash.ts";

type InsecureBasicAuth = {
  type: "insecure-basic_auth";
  username: string;
  password: string;
  key: string;
};

type Pbkdf2Auth = {
  type: "pbkdf2";
  username: string;
  salt: string;
  b64Hash: string;
  key: string;
};

type UserDefinition = Pbkdf2Auth | InsecureBasicAuth;

let hasReadUsersFile = false;
const knownUsers: UserDefinition[] = [];

export function getMatchingUser(
  username: string,
  password: string,
): Promise<string | undefined> {
  ensureUsersFileRead();
  for (const user of knownUsers) {
    if (
      user.type === "insecure-basic_auth" &&
      user.username === username &&
      user.password === password
    ) {
      return Promise.resolve(user.key);
    } else if (
      user.type === "pbkdf2" &&
      user.username === username &&
      pbkdf2Compare(user, password)
    ) {
      return Promise.resolve(user.key);
    }
  }
  return Promise.resolve(undefined);
}

export function getUserMatchingApiKey(apiKey: string) {
  ensureUsersFileRead();
  for (const user of knownUsers) {
    if (user.key === apiKey) {
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
    if (user.type === "insecure-basic_auth") {
      knownUsers.push(user as InsecureBasicAuth);
    } else if (user.type === "pbkdf2") {
      knownUsers.push(user as Pbkdf2Auth);
    }
  }

  hasReadUsersFile = true;
}

function pbkdf2Compare(user: Pbkdf2Auth, password: string) {
  const result = pbkdf2Hash(password, user.salt);
  return user.b64Hash === result;
}
