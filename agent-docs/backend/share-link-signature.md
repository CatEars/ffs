# Share Link Signature

## Overview

This document describes how the HMAC-based `signature` URL parameter is generated and verified for share links, and how it binds to the encoded `code` parameter.

## URL Parameters

A share link carries two query parameters:

| Parameter | Description |
|---|---|
| `code` | Opaque, scheme-prefixed string encoding the shared file paths (see [share-link-schemes.md](./share-link-schemes.md)) |
| `signature` | HMAC-SHA256 signature over the `code` value, base64url-encoded alongside the signed claims |

Example:
```
/share-file/view?code=raw-paths:W1...&signature=eyJjb...
```

## Signing Flow

When a share link is created (`POST /api/link`), the backend:

1. Encodes the selected file paths into a `code` string via `shareLinkSchemeRegistry.createCode(...)`.
2. Wraps the `code` as a `Resource` claim using `fileShareResources.nameForResource(code)`.
3. Signs the claim using `signAndUrlEncodeClaims([claim])`, which:
   - JSON-serialises the claims array.
   - Computes HMAC-SHA256 over the serialised string using the instance secret.
   - Returns `base64url({ claims: "<json>", hmac: "<base64>" })` as the `signature`.

```
code  ──► nameForResource(code) ──► [claim]
                                        │
                               signAndUrlEncodeClaims
                                        │
                                    signature
```

## Verification Flow

Every API call that serves shared content passes through the `shareProtect` middleware:

1. Reads `code` and `signature` from the URL search params.
2. Calls `verifyAndUrlDecodeClaims(signature)`, which:
   - Decodes the base64url wrapper.
   - Re-computes HMAC-SHA256 over the embedded claims string.
   - Returns the parsed claims array on success, or `null` on tamper or invalid format.
3. Reconstructs the expected resource via `fileShareResources.nameForResource(code)`.
4. Calls `fileShareResources.mayAccess(verifiedClaims, codeResource)` — passes only if the verified claims grant access to the exact `code` value that was signed at creation time.
5. Returns `401 Unauthorized` if any step fails; calls `next()` on success.

```
(code, signature)
       │
verifyAndUrlDecodeClaims(signature) ──► verifiedClaims (or null → 401)
       │
nameForResource(code) ──► codeResource
       │
mayAccess(verifiedClaims, codeResource) ──► 401 | next()
```

## Security Properties

- **Tamper resistance** — the `signature` is bound to the exact `code` string. Changing any character of `code` invalidates the signature.
- **Server-only issuance** — the HMAC key is the instance secret, so only the server can produce a valid `signature`.
- **No path exposure in signature** — the signature covers the encoded `code`, not the raw file paths. The paths are only materialised when a verified request hits the list/download handlers.

## Relevant Files

| File | Role |
|---|---|
| `src/share-file/share-protect.ts` | `generateSignatureForCode` and `shareProtect` middleware |
| `src/share-file/create-file-link.ts` | Orchestrates code + signature creation and redirects |
| `src/security/claims.ts` | `signAndUrlEncodeClaims` / `verifyAndUrlDecodeClaims` primitives |
| `src/security/resources.ts` | `ResourceManager` — claim construction and access-check helpers |
