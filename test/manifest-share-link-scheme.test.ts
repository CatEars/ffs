import { assertEquals } from '@std/assert/equals';
import { assert } from '@std/assert/assert';
import { assertRejects } from '@std/assert/rejects';
import { join } from '@std/path';
import { ManifestShareLinkScheme } from '../src/share-file/manifest-share-link-scheme.ts';
import './init-test-config.ts';
import { getCacheRoot } from '../src/config.ts';

const scheme = new ManifestShareLinkScheme();

Deno.test('schemeId returns "manifest"', () => {
    assertEquals(scheme.schemeId(), 'manifest');
});

Deno.test('isAvailable returns true when enough disk space is available', async () => {
    assert(await scheme.isAvailable({ paths: [] }));
});

Deno.test('createCode returns a SHA256 hex string', async () => {
    const paths = ['folder/file1.txt'];
    const code = await scheme.createCode({ paths });
    assertEquals(code.length, 64);
    assert(/^[0-9a-f]+$/.test(code));
});

Deno.test('createCode creates a manifest file in the cache directory', async () => {
    const paths = ['folder/file1.txt', 'folder/file2.txt'];
    const code = await scheme.createCode({ paths });
    const manifestFile = join(getCacheRoot(), 'share-manifests', `${code}.json`);
    const content = await Deno.readTextFile(manifestFile);
    assertEquals(JSON.parse(content), { paths });
});

Deno.test('createCode produces the same code for the same paths', async () => {
    const paths = ['a.txt', 'b.txt'];
    const code1 = await scheme.createCode({ paths });
    const code2 = await scheme.createCode({ paths });
    assertEquals(code1, code2);
});

Deno.test('createCode and decodeCode are inverse operations', async () => {
    const paths = ['folder/file1.txt', 'folder/file2.txt'];
    const code = await scheme.createCode({ paths });
    const decoded = await scheme.decodeCode(code);
    assertEquals(decoded.paths, paths);
});

Deno.test('createCode and decodeCode work for empty paths array', async () => {
    const code = await scheme.createCode({ paths: [] });
    const decoded = await scheme.decodeCode(code);
    assertEquals(decoded.paths, []);
});

Deno.test('decodeCode rejects when manifest file does not exist', async () => {
    await assertRejects(() => scheme.decodeCode('0'.repeat(64)));
});

Deno.test('decodeCode rejects a code containing path traversal characters', async () => {
    await assertRejects(() => scheme.decodeCode('../../../etc/passwd'));
});

Deno.test('decodeCode rejects a code that is not a valid SHA256 hex string', async () => {
    await assertRejects(() => scheme.decodeCode('not-a-hash'));
});
