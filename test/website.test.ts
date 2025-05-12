import { assertEquals } from "@std/assert/equals";
import { baseUrl } from "./constants.ts";
import { HTTP_200_OK, HTTP_401_UNAUTHORIZED } from "../src/utils/http-codes.ts";
import { assert } from "@std/assert/assert";
import { authenticatedFetch } from "./authenticated-fetch.ts";

Deno.test("there is a website that kinda looks like HTML", async () => {
  const result = await fetch(baseUrl + "/");
  assertEquals(HTTP_200_OK, result.status);
  assert((await result.text()).includes("<!DOCTYPE html>"));
});

Deno.test("there is a 'failed to logon' webpage that kinda looks like HTML", async () => {
  const result = await fetch(baseUrl + "/logon/fail");
  assertEquals(HTTP_200_OK, result.status);
  assert((await result.text()).includes("<!DOCTYPE html>"));
});

Deno.test("It is not possible to access homepage without authentication", async () => {
  const result = await fetch(baseUrl + "/home/");
  await result.text();
  assertEquals(result.status, HTTP_401_UNAUTHORIZED);
});

Deno.test("It is possible to access homepage with authentication", async () => {
  const result = await authenticatedFetch(baseUrl + "/home/");
  await result.text();
  assertEquals(result.status, HTTP_200_OK);
});

Deno.test("You can load bootstrap css as static file", async () => {
  const result = await fetch(baseUrl + "/static/bootstrap.min.css");
  await result.body?.cancel();
  assertEquals(HTTP_200_OK, result.status);
  assertEquals("text/css; charset=UTF-8", result.headers.get("Content-Type"));
});

Deno.test("You can load bootstrap js as static files", async () => {
  const result = await fetch(baseUrl + "/static/bootstrap.min.js");
  await result.body?.cancel();
  assertEquals(HTTP_200_OK, result.status);
  assertEquals(
    "text/javascript; charset=UTF-8",
    result.headers.get("Content-Type"),
  );
});

Deno.test("You can load alpine.js as static file", async () => {
  const result = await fetch(baseUrl + "/static/alpine.min.js");
  await result.body?.cancel();
  assertEquals(HTTP_200_OK, result.status);
  assertEquals(
    "text/javascript; charset=UTF-8",
    result.headers.get("Content-Type"),
  );
});
