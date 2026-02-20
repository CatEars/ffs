import { assertEquals } from '@std/assert/equals';
import { assert } from '@std/assert/assert';
import { assertFalse } from '@std/assert/false';
import { assertThrows } from '@std/assert/throws';
import { RawPathsShareLinkScheme } from '../src/share-file/raw-paths-share-link-scheme.ts';

const scheme = new RawPathsShareLinkScheme();

Deno.test('schemeId returns "raw-paths"', () => {
    assertEquals(scheme.schemeId(), 'raw-paths');
});

Deno.test('isAvailable returns true when total paths length is within limit', () => {
    assert(scheme.isAvailable({ paths: ['short/path.txt'] }));
});

Deno.test('isAvailable returns false when total paths length exceeds limit', () => {
    const longPath = 'a'.repeat(1300);
    assertFalse(scheme.isAvailable({ paths: [longPath] }));
});

Deno.test('isAvailable returns true for empty paths array', () => {
    assert(scheme.isAvailable({ paths: [] }));
});

Deno.test('createCode and decodeCode are inverse operations', () => {
    const paths = ['folder/file1.txt', 'folder/file2.txt'];
    const code = scheme.createCode({ paths });
    const decoded = scheme.decodeCode(code);
    assertEquals(decoded.paths, paths);
});

Deno.test('createCode and decodeCode work for empty paths array', () => {
    const code = scheme.createCode({ paths: [] });
    const decoded = scheme.decodeCode(code);
    assertEquals(decoded.paths, []);
});

Deno.test('decodeCode throws on invalid base64url input', () => {
    assertThrows(() => scheme.decodeCode('not-valid-base64url!!!'));
});
