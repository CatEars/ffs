import { assert } from "@std/assert/assert";
import { baseUrl } from "./constants.ts";
import { assertEquals } from "@std/assert/equals";

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
  assertEquals(response["key"], "bab5b6be-2aad-11f0-a2ca-3b8bfdd0a613");
});

Deno.test("Using the right username and password gets us the API key - pbkdf2", async () => {
  const result = await fetch(baseUrl + "/api/logon", {
    method: "POST",
    body: JSON.stringify({
      "username": "admin2",
      "password": "ffsadmin",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response = await result.json();
  assert(response["isOk"]);
  assertEquals(response["key"], "780423cd-0bde-489a-8a2c-369e12c22f19");
});
