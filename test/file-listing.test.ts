import { assert } from "@std/assert/assert";
import { assertEquals } from "@std/assert";
import { baseUrl } from "./constants.ts";
import {
  HTTP_401_UNAUTHORIZED,
  HTTP_403_FORBIDDEN,
  HTTP_404_NOT_FOUND,
} from "../src/utils/http-codes.ts";
import { authenticatedFetch } from "./authenticated-fetch.ts";

type FileListing = {
  name: string;
  isFile: boolean;
};

Deno.test("Can fetch directory contents", async () => {
  const result = await authenticatedFetch(baseUrl + "/api/directory?path=.");
  const directoryListing = await result.json();
  assert(
    directoryListing.some((x: FileListing) =>
      x.name === "deno.json" && x.isFile
    ),
  );
});

Deno.test("Cannot fetch a super-directory of the store directory", async () => {
  const result = await authenticatedFetch(baseUrl + "/api/directory?path=..");
  await result.text();
  assertEquals(result.status, HTTP_404_NOT_FOUND);
});

Deno.test("Cannot fetch / directory", async () => {
  const result = await authenticatedFetch(baseUrl + "/api/directory?path=/");
  await result.text();
  assertEquals(result.status, HTTP_404_NOT_FOUND);
});

Deno.test("Listing directory gets unauthorized when not using API key", async () => {
  const result = await fetch(baseUrl + "/api/directory?path=.");
  await result.text();
  assertEquals(result.status, HTTP_401_UNAUTHORIZED);
});

Deno.test("Fetching file works", async () => {
  const result = await authenticatedFetch(baseUrl + "/api/file?path=deno.json");
  const denoFile = await result.json();
  assert(denoFile["imports"] && denoFile["imports"]["@oak/oak"]);
});

Deno.test("Not allowed to fetch a super-directory of the store directory", async () => {
  const result = await authenticatedFetch(baseUrl + "/api/file?path=..");
  await result.text();
  assertEquals(result.status, HTTP_403_FORBIDDEN);
});

Deno.test("Not allowed to fetch / directory as file", async () => {
  const result = await authenticatedFetch(baseUrl + "/api/file?path=/");
  await result.text();
  assertEquals(result.status, HTTP_404_NOT_FOUND);
});
