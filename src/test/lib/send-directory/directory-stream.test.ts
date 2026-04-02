import { assert } from '@std/assert/assert';
import { TarStreamInput } from '@std/tar/tar-stream';
import {
    exploreAndCollectFullDirectoryInfo,
    streamDirectoryAsTarGzip,
} from '../../../lib/send-directory/directory-stream.ts';

function closeFiles(entries: TarStreamInput[]) {
    for (const entry of entries) {
        if (entry.type == 'file') {
            entry.readable.cancel();
        }
    }
}

Deno.test('exploreAndCollectFullDirectoryInfo yields file entries for files in a directory', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/hello.txt', 'hello');

    const entries = [];
    for await (const entry of exploreAndCollectFullDirectoryInfo(tempDir)) {
        entries.push(entry);
    }

    assert(entries.some((e) => e.type === 'file' && e.path.endsWith('hello.txt')));
    closeFiles(entries);
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('exploreAndCollectFullDirectoryInfo yields directory entries', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.mkdir(tempDir + '/subdir');
    await Deno.writeTextFile(tempDir + '/subdir/file.txt', 'x');

    const entries = [];
    for await (const entry of exploreAndCollectFullDirectoryInfo(tempDir)) {
        entries.push(entry);
    }

    assert(entries.some((e) => e.type === 'directory'));
    closeFiles(entries);
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('exploreAndCollectFullDirectoryInfo applies pathPrefix to entry paths', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/file.txt', 'x');

    const entries = [];
    for await (const entry of exploreAndCollectFullDirectoryInfo(tempDir, 'prefix/')) {
        entries.push(entry);
    }

    assert(entries.some((e) => e.path.startsWith('prefix/')));
    closeFiles(entries);
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('streamDirectoryAsTarGzip returns a ReadableStream', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/file.txt', 'content');

    const stream = streamDirectoryAsTarGzip(tempDir);
    assert(stream instanceof ReadableStream);

    await stream.cancel();
    await Deno.remove(tempDir, { recursive: true });
});

Deno.test('streamDirectoryAsTarGzip produces a non-empty stream for a non-empty directory', async () => {
    const tempDir = await Deno.makeTempDir();
    await Deno.writeTextFile(tempDir + '/file.txt', 'some content');

    const stream = streamDirectoryAsTarGzip(tempDir);
    const reader = stream.getReader();
    const { value } = await reader.read();
    assert(value !== undefined && value.length > 0);

    await reader.cancel();
    await Deno.remove(tempDir, { recursive: true });
});
