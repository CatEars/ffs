# Share Link Signature

## Overview

This document describes how the single `code` URL parameter is generated and verified for share links. It combines the encoded file paths and their HMAC into one opaque value.

## URL Parameter

A share link carries a single query parameter:

| Parameter | Description |
|---|---|
| `code` | Signed blob: `base64url({ claims: [[pathCode]], hmac: "<base64-hmac>" })`, where `pathCode` is the scheme-prefixed path encoding (see [share-link-schemes.md](./share-link-schemes.md)) |

Example:
```
/share-file/view?code=eyJjbGFpbXMiOiJbW1wicmF3L...
```

## Signing Flow

When a share link is created (`POST /api/link`), the backend:

1. Encodes the selected file paths into a `pathCode` string via `shareLinkSchemeRegistry.createCode(...)`.
2. Wraps `pathCode` as a `Resource` claim using `fileShareResources.nameForResource(pathCode)`.
3. Signs the claim using `signAndUrlEncodeClaims([claim])`, which:
   - JSON-serialises the claims array.
   - Computes HMAC-SHA256 over the serialised string using the instance secret.
   - Returns `base64url({ claims: "<json>", hmac: "<base64>" })` as the `code`.
4. Redirects to `/share-file/view?code=<signedBlob>`.

```
paths  ──► createCode() ──► pathCode
                                │
                       nameForResource(pathCode)
                                │
                       signAndUrlEncodeClaims([claim])
                                │
                             code  (single URL param)
```

## Verification Flow

Every API call that serves shared content passes through the `shareProtect` middleware:

1. Reads `code` from the URL search params.
2. Calls `verifyAndUrlDecodeClaims(code)`, which:
   - Decodes the base64url wrapper.
   - Re-computes HMAC-SHA256 over the embedded claims string.
   - Returns the parsed claims array on success, or `null` on tamper or invalid format.
3. Extracts `pathCode` from the first verified claim (`verifiedClaims[0][0]`).
4. Stores `pathCode` in `ctx.state.pathCode` for downstream handlers and calls `next()`.
5. Returns `400 Bad Request` if `code` is missing, `401 Unauthorized` if HMAC verification fails or claims are malformed.

```
code (URL param)
       │
verifyAndUrlDecodeClaims(code) ──► verifiedClaims (or null → 401)
       │
verifiedClaims[0][0] ──► pathCode
       │
ctx.state.pathCode ──► next()
```

Downstream handlers (list, download) then call `shareLinkSchemeRegistry.decodeCode(ctx.state.pathCode)` to recover the file paths.

## Security Properties

- **No redundancy** — the `code` param carries both the path encoding and its HMAC; there is no separate signature parameter.
- **Tamper resistance** — changing any character of `code` invalidates the HMAC.
- **Server-only issuance** — the HMAC key is the instance secret, so only the server can produce a valid `code`.
- **Single source of truth** — the path encoding is extracted from the verified claims, not from a separate URL param that could diverge.

## Relevant Files

| File | Role |
|---|---|
| `src/share-file/share-protect.ts` | `generateSignedCode` and `shareProtect` middleware |
| `src/share-file/create-file-link.ts` | Orchestrates pathCode + signing and redirects |
| `src/share-file/get-shared-file.ts` | Reads `pathCode` from `ctx.state` set by `shareProtect` |
| `src/security/claims.ts` | `signAndUrlEncodeClaims` / `verifyAndUrlDecodeClaims` primitives |
| `src/security/resources.ts` | `ResourceManager` — claim construction helpers |
