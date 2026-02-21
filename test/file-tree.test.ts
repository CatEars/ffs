import { assertEquals } from '@std/assert/equals';
import { FileTree } from '../src/files/file-tree.ts';
import { resolve } from '@std/path/resolve';
import { assert } from '@std/assert/assert';
import { fail } from '@std/assert/fail';

const sampleFileTree = new FileTree('.');

Deno.test('File tree resolves path correctly', async () => {
    assertEquals(await sampleFileTree.resolvePath('.'), {
        type: 'valid',
        fullPath: resolve('.'),
        exists: true,
    });
});

Deno.test('File tree with path traversal exploits returns invalid path', async () => {
    assertEquals(await sampleFileTree.resolvePath('../../../../etc/passwd'), {
        type: 'invalid',
    });
});

Deno.test('File tree can list a directory using relative path', async () => {
    const listing = await sampleFileTree.listDirectory('./test/');
    if (listing.type === 'none') {
        fail();
    } else {
        assert(
            listing.files.some((x) => x.isFile && x.name === 'file-tree.test.ts'),
        );
    }
});

Deno.test('File tree returns invalid result when using a bad path', async () => {
    const listing = await sampleFileTree.listDirectory(
        './thisdoesnotexistsandhopefullyneverwill/',
    );
    assertEquals(listing.type, 'none');
});

Deno.test('File tree returns invalid result when using a file', async () => {
    const listing = await sampleFileTree.listDirectory(
        './test/file-tree.test.ts',
    );
    assertEquals(listing.type, 'none');
});

Deno.test('File tree can resolve symbolic directory links that are still under the root', async () => {
    const listing = await sampleFileTree.listDirectory(
        './test/symbolic-links-for-testing/code-root',
    );
    if (listing.type === 'none') {
        fail();
    } else {
        assert(
            listing.files.some((x) => x.isFile && x.name === 'deno.json'),
        );
    }
});

Deno.test('File tree returns invalid result when resolving symbolic directory links that are outside the root', async () => {
    const listing = await sampleFileTree.listDirectory(
        './test/symbolic-links-for-testing/above-code-root',
    );
    assertEquals(listing.type, 'none');
});

Deno.test('File tree can stat individual files under a directory', async () => {
    const listing = await sampleFileTree.listDirectory('./test/');
    if (listing.type === 'none') {
        fail();
    } else {
        const statResult = await sampleFileTree.stat(listing, 'file-tree.test.ts');
        if (statResult.type === 'invalid') {
            fail();
        } else {
            assert(statResult.info.isFile);
        }
    }
});

Deno.test('When resolving files that do not exist, inside a file tree, the resulting path is returned', async () => {
    const resolved = await sampleFileTree.resolvePath(
        './test/this-file-does-not-exist.ts',
    );
    assertEquals(resolved.type, 'valid');
});

Deno.test('When resolving files that do not exist, outside the file tree, an invalid result is returned', async () => {
    const resolved = await sampleFileTree.resolvePath(
        '../../../test/this-file-does-not-exist.ts',
    );
    assertEquals(resolved.type, 'invalid');
});
