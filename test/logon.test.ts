import { assert } from "@std/assert/assert";
import { baseUrl } from "./constants.ts";
import { assertEquals } from "@std/assert/equals";
import { testApiKey } from "../src/config.ts";

Deno.test("Using the right username and password gets us the API key", async () => {
  const result = await fetch(baseUrl + "/api/logon", {
    method: "POST",
    body: JSON.stringify({
      "username": "admin",
      "password": "ffsadmin",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response = await result.json();
  assert(response["isOk"]);
  assertEquals(response["key"], testApiKey);
});
