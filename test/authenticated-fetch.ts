import { apiKey } from "../src/config.ts";

export function authenticatedFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      "Authorization": `FFS ${apiKey()}`,
    },
  });
}
