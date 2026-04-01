import { assert } from '@std/assert/assert';
import { assertEquals } from '@std/assert/equals';
import { clearAndEnsureDirectoryExists } from './clear-and-ensure-dir.ts';

Deno.test('clearAndEnsureDirectoryExists creates a new directory when it does not exist', async () => {
    const tempDir = await Deno.makeTempDir();
    const newDir = tempDir + '/new-dir';
    await clearAndEnsureDirectoryExists(newDir);
    const stat = await Deno.stat(newDir);
    assert(stat.isDirectory);
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('clearAndEnsureDirectoryExists clears an existing directory', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/file.txt', 'hello');
    await clearAndEnsureDirectoryExists(tempDir);
    const entries = [];
    for await (const entry of Deno.readDir(tempDir)) {
        entries.push(entry);
    }
    assertEquals(entries.length, 0);
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('clearAndEnsureDirectoryExists succeeds when the directory does not exist yet', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.remove(tempDir);
    await clearAndEnsureDirectoryExists(tempDir);
    const stat = await Deno.stat(tempDir);
    assert(stat.isDirectory);
    await Deno.remove(tempDir);
});
