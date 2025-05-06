import { testApiKey } from "../config.ts";

export async function getMatchingUser(username: string, password: string) {
  if (username === "admin" && password === "ffsadmin") {
    return testApiKey;
  }
}
