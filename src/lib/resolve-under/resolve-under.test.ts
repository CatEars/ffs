import { assert } from '@std/assert/assert';
import { assertEquals } from '@std/assert/equals';
import { resolveUnder } from './resolve-under.ts';

Deno.test('resolveUnder returns the resolved path for a valid sub-path', () => {
    const result = resolveUnder('file.txt', '/root');
    assertEquals(result, '/root/file.txt');
});

Deno.test('resolveUnder returns null for a path traversal above root', () => {
    const result = resolveUnder('../../etc/passwd', '/root');
    assertEquals(result, null);
});

Deno.test('resolveUnder returns null for an absolute path outside root', () => {
    const result = resolveUnder('/etc/passwd', '/root');
    assertEquals(result, null);
});

Deno.test('resolveUnder allows paths that resolve to the root itself', () => {
    const result = resolveUnder('.', '/root');
    assert(result !== null);
    assertEquals(result, '/root');
});

Deno.test('resolveUnder handles nested subdirectory paths', () => {
    const result = resolveUnder('a/b/c.txt', '/root');
    assertEquals(result, '/root/a/b/c.txt');
});
