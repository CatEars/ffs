import { assertEquals } from "@std/assert/equals";
import { baseUrl } from "./constants.ts";
import { HTTP_200_OK } from "../src/utils/http-codes.ts";
import { assert } from "@std/assert/assert";

Deno.test("there is a website that kinda looks like HTML", async () => {
  const result = await fetch(baseUrl + "/app");
  assertEquals(HTTP_200_OK, result.status);
  assert((await result.text()).includes("<!DOCTYPE html>"));
});
