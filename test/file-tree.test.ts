import { assertEquals } from "@std/assert/equals";
import { FileTree } from "../src/files/file-tree.ts";
import { resolve } from "@std/path/resolve";
import { assert } from "@std/assert/assert";
import { fail } from "@std/assert/fail";

const sampleFileTree = new FileTree(".");

Deno.test("File tree resolves path correctly", () => {
  assertEquals(sampleFileTree.resolvePath("."), {
    type: "valid",
    fullPath: resolve("."),
  });
});

Deno.test("File tree with path traversal exploits returns invalid path", () => {
  assertEquals(sampleFileTree.resolvePath("../../../../etc/passwd"), {
    type: "invalid",
  });
});

Deno.test("File tree can list a directory using relative path", () => {
  const listing = sampleFileTree.listDirectory("./test/");
  if (listing.type === "none") {
    fail();
  } else {
    assert(
      listing.files.some((x) => x.isFile && x.name === "file-tree.test.ts"),
    );
  }
});

Deno.test("File tree returns invalid result when using a bad path", () => {
  const listing = sampleFileTree.listDirectory(
    "./thisdoesnotexistsandhopefullyneverwill/",
  );
  assertEquals(listing.type, "none");
});

Deno.test("File tree returns invalid result when using a file", () => {
  const listing = sampleFileTree.listDirectory(
    "./test/file-tree.test.ts",
  );
  assertEquals(listing.type, "none");
});

Deno.test("File tree can resolve symbolic directory links that are still under the root", () => {
  const listing = sampleFileTree.listDirectory(
    "./test/symbolic-links-for-testing/code-root",
  );
  if (listing.type === "none") {
    fail();
  } else {
    assert(
      listing.files.some((x) => x.isFile && x.name === "deno.json"),
    );
  }
});

Deno.test("File tree returns invalid result when resolving symbolic directory links that are outside the root", () => {
  const listing = sampleFileTree.listDirectory(
    "./test/symbolic-links-for-testing/above-code-root",
  );
  assertEquals(listing.type, "none");
});
