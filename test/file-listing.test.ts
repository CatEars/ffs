import { assert } from "@std/assert/assert";
import { baseUrl } from "./constants.ts";

Deno.test("Can fetch directory contents", async () => {
  const result = await fetch(baseUrl + "directory?path=.");
  const directoryListing = await result.json();
  assert(directoryListing.some((x: any) => x.name === "deno.json" && x.isFile));
});
