import { assert } from '@std/assert/assert';
import { assertEquals } from '@std/assert/equals';
import { FileTreeWalker } from './file-tree-walker.ts';

Deno.test('FileTreeWalker lists files in a directory', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/a.txt', 'a');
    await Deno.writeTextFile(tempDir + '/b.txt', 'b');

    const walker = new FileTreeWalker(tempDir);
    const results = await walker.collectAll();

    assertEquals(results.length, 2);
    assert(results.some((e) => e.name === 'a.txt'));
    assert(results.some((e) => e.name === 'b.txt'));
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('FileTreeWalker returns "/" as parent for files at the root', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/file.txt', 'x');

    const walker = new FileTreeWalker(tempDir);
    const results = await walker.collectAll();

    assertEquals(results[0].parent, '/');
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('FileTreeWalker returns the subdirectory as parent for nested files', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.mkdir(tempDir + '/sub');
    await Deno.writeTextFile(tempDir + '/sub/file.txt', 'x');

    const walker = new FileTreeWalker(tempDir);
    const results = await walker.collectAll();

    assertEquals(results[0].parent, '/sub/');
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('FileTreeWalker filter can exclude files', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/a.ts', 'a');
    await Deno.writeTextFile(tempDir + '/b.txt', 'b');

    const walker = new FileTreeWalker(tempDir);
    walker.filter((entry) => entry.name.endsWith('.ts'));
    const results = await walker.collectAll();

    assertEquals(results.length, 1);
    assertEquals(results[0].name, 'a.ts');
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('FileTreeWalker returns empty results for an empty directory', async () => {
    const tempDir = await Deno.makeTempDir();
    const walker = new FileTreeWalker(tempDir);
    const results = await walker.collectAll();
    assertEquals(results, []);
    await Deno.remove(tempDir);
});
