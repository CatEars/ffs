# Share Link Schemes

## Overview

This document describes the abstraction layer introduced for generating and decoding shareable file links in the backend.

## Problem

The logic for encoding file paths into a shareable URL was inlined across three files (`create-file-link.ts`, `get-shared-file.ts`, `share-protect.ts`) with no abstraction boundary. This made it impossible to introduce alternative link encoding strategies without duplicating or forking the existing logic.

## Solution

A `ShareLinkScheme` interface is introduced, backed by a `ShareLinkSchemeRegistry` that applies a chain-of-responsibility pattern to select and dispatch the appropriate scheme at runtime.

### Key Concepts

- **`ShareLinkScheme`** — interface each encoding strategy must implement
- **`ShareLinkSchemeRegistry`** — iterates registered schemes in order, picks the first available one
- **`RawPathsShareLinkScheme`** — the built-in implementation that base64url-encodes a JSON array of file paths

## Interface

```typescript
// src/share-file/share-link-scheme.ts

export interface ShareLinkScheme {
    schemeId(): string;
    isAvailable(ctx: ShareContext): Promise<boolean>;
    createCode(ctx: ShareContext): Promise<string>;
    decodeCode(code: string): Promise<DecodedShare>;
}
```

| Method | Description |
|---|---|
| `schemeId()` | Returns a stable string identifier for this scheme (e.g. `"raw-paths"`) |
| `isAvailable(ctx)` | Returns `true` if this scheme can encode the given context (e.g. paths within size limits or sufficient disk space) |
| `createCode(ctx)` | Encodes the context into an opaque string payload |
| `decodeCode(code)` | Decodes the payload back into a `DecodedShare` (`{ paths }`) |

## Registry (Chain of Responsibility)

`ShareLinkSchemeRegistry` holds an ordered list of schemes. When creating a link:

1. It iterates the list and picks the **first** scheme where `isAvailable` returns `true`.
2. It returns `${schemeId}:${payload}` — the scheme id is prepended so that decoding can route to the correct implementation without any out-of-band metadata.

When decoding:

1. It splits the code at the first `:` to extract the scheme id and payload.
2. It finds the matching scheme by id and delegates `decodeCode` to it.
3. Throws on a missing separator or unknown scheme id, which callers turn into a `400 Bad Request`.

```typescript
// src/share-file/share-link-scheme-registry.ts
export const shareLinkSchemeRegistry = new ShareLinkSchemeRegistry([
    rawPathsShareLinkScheme,
    manifestShareLinkScheme,
]);
```

Adding a new encoding strategy requires only implementing `ShareLinkScheme` and inserting the instance at the desired position in this list.

## Built-in Implementation: `RawPathsShareLinkScheme`

```
schemeId: "raw-paths"
```

Encodes a list of file paths as a base64url-encoded JSON array.

- `isAvailable` — returns `true` when the JSON-serialized paths are ≤ 1250 characters.
- `createCode` — `base64url(JSON.stringify(paths))`
- `decodeCode` — reverses the above.

## Built-in Implementation: `ManifestShareLinkScheme`

```
schemeId: "manifest"
```

Stores file paths as a JSON manifest on disk and uses the SHA-256 hash of the paths as the share code. Used as a fallback when paths are too large for a URL.

- `isAvailable` — returns `true` when `FFS_CACHE_DIR` has ≥ 50 MB free.
- `createCode` — writes `{ paths: [...] }` to `{FFS_CACHE_DIR}/share-manifests/<hash>.json`; returns the 64-char hex hash.
- `decodeCode` — validates the code is a SHA-256 hex string (path traversal protection), then reads the manifest file.

See [manifest-share-link-scheme.md](./manifest-share-link-scheme.md) for full details.

## Files

| File | Role |
|---|---|
| `src/share-file/share-link-scheme.ts` | `ShareLinkScheme` interface, `ShareContext` and `DecodedShare` types |
| `src/share-file/raw-paths-share-link-scheme.ts` | `RawPathsShareLinkScheme` implementation |
| `src/share-file/manifest-share-link-scheme.ts` | `ManifestShareLinkScheme` implementation |
| `src/share-file/share-link-scheme-registry.ts` | `ShareLinkSchemeRegistry` and the singleton registry |

## Call Sites

All three entry points in the file-sharing flow now go through `shareLinkSchemeRegistry`:

| File | Usage |
|---|---|
| `create-file-link.ts` | Calls `isAvailable` (→ 400 if false) then `createCode` |
| `get-shared-file.ts` | Calls `decodeCode` to retrieve file paths |
| `share-protect.ts` | Calls `decodeCode` inside a try/catch (→ 400 on malformed codes) |
