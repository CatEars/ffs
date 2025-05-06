import { getApiKey } from "../src/config.ts";
import "./init-test-config.ts";

export function authenticatedFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      "Authorization": `FFS ${getApiKey()}`,
    },
  });
}
