import { assertEquals } from '@std/assert/equals';
import { assert } from '@std/assert/assert';
import { assertFalse } from '@std/assert/false';
import { assertThrows } from '@std/assert/throws';
import { PathsShareLinkProtocol } from '../src/share-file/paths-share-link-protocol.ts';

const protocol = new PathsShareLinkProtocol();

Deno.test('protocolId returns "paths"', () => {
    assertEquals(protocol.protocolId(), 'paths');
});

Deno.test('isAvailable returns true when total paths length is within limit', () => {
    assert(protocol.isAvailable({ paths: ['short/path.txt'] }));
});

Deno.test('isAvailable returns false when total paths length exceeds limit', () => {
    const longPath = 'a'.repeat(1300);
    assertFalse(protocol.isAvailable({ paths: [longPath] }));
});

Deno.test('isAvailable returns true for empty paths array', () => {
    assert(protocol.isAvailable({ paths: [] }));
});

Deno.test('createCode and decodeCode are inverse operations', () => {
    const paths = ['folder/file1.txt', 'folder/file2.txt'];
    const code = protocol.createCode({ paths });
    const decoded = protocol.decodeCode(code);
    assertEquals(decoded.paths, paths);
});

Deno.test('createCode and decodeCode work for empty paths array', () => {
    const code = protocol.createCode({ paths: [] });
    const decoded = protocol.decodeCode(code);
    assertEquals(decoded.paths, []);
});

Deno.test('decodeCode throws on invalid base64url input', () => {
    assertThrows(() => protocol.decodeCode('not-valid-base64url!!!'));
});
