# Manifest Share Link Scheme

## Overview

This document describes the `manifest` share link scheme — a disk-backed alternative to `raw-paths` for sharing large sets of file paths that would exceed safe URL length limits.

## Problem

The `raw-paths` scheme encodes file paths directly into the share URL as a base64url string. This works well for small selections, but becomes unsafe when the JSON-serialised paths exceed ~1250 characters, at which point a URL may be truncated or rejected by browsers and proxies.

## Solution

The `manifest` scheme writes the file paths to a JSON file on disk (a *manifest*) and uses the SHA-256 hash of the paths as both the share code and the manifest filename. Because the code is a fixed-length 64-character hex string, the URL stays short regardless of how many files are shared.

### Availability

The scheme is available when `FFS_CACHE_DIR` has at least **50 MB** of free disk space. If disk space cannot be determined (e.g. the cache directory does not exist), the scheme reports itself as unavailable.

### Registry Order

`raw-paths` is registered before `manifest` in `ShareLinkSchemeRegistry`. The registry picks the first available scheme, so manifest files are only created when `raw-paths` is unavailable (i.e. the paths are too large for a URL). This avoids unnecessary filesystem writes for typical shares.

## Code and Manifest File

```
code  =  SHA256( JSON.stringify(paths) )   // 64-char lowercase hex string
file  =  {FFS_CACHE_DIR}/share-manifests/{code}.json
```

The manifest file is a JSON object:

```json
{
    "paths": ["/store/docs/report.pdf", "/store/photos/img001.jpg"]
}
```

Using an object (rather than a bare array) allows additional fields to be added in future without breaking existing manifests.

The SHA-256 is computed over the JSON-serialised **bare array** of paths (`JSON.stringify(paths)`), not over the manifest object, so the code is stable and deterministic regardless of future manifest format changes.

## Security: Path Traversal Protection

`decodeCode` validates the supplied code against `/^[0-9a-f]{64}$/` before constructing a file path. Any input that is not exactly 64 lowercase hex characters — including path traversal sequences such as `../../../etc/passwd` — is rejected immediately with a generic error. User-supplied input is never echoed in the error message.

```typescript
async decodeCode(code: string): Promise<DecodedShare> {
    if (!SHA256_HEX_REGEX.test(code)) {
        throw new Error('Invalid manifest code: not a valid SHA-256 hex string');
    }
    const content = await Deno.readTextFile(manifestPath(code));
    const { paths } = JSON.parse(content);
    if (!Array.isArray(paths)) {
        throw new Error('Invalid manifest: missing paths array');
    }
    return { paths };
}
```

## Files

| File | Role |
|---|---|
| `src/share-file/manifest-share-link-scheme.ts` | `ManifestShareLinkScheme` implementation and singleton export |
| `src/share-file/share-link-scheme-registry.ts` | Registers the manifest scheme after `raw-paths` |
| `src/utils/disk-space.ts` | `availableDiskBytes` used by `isAvailable` |
| `test/manifest-share-link-scheme.test.ts` | Unit tests for the scheme |

## Flow

### Creating a share

```
paths
  │
  ├─ JSON.stringify(paths) ──► SHA256 ──► hash (code)
  │
  └─ write {FFS_CACHE_DIR}/share-manifests/{hash}.json
       { "paths": [...] }
  │
  └─ return hash
```

### Decoding a share

```
code (from URL)
  │
  ├─ regex check: /^[0-9a-f]{64}$/  ──► reject if invalid
  │
  └─ read {FFS_CACHE_DIR}/share-manifests/{code}.json
       ──► parse { paths }
       ──► return { paths }
```
