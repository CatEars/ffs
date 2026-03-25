import { walk } from '@std/fs/walk';
import { relative } from '@std/path/relative';
import { TarStream, TarStreamInput } from '@std/tar/tar-stream';

export async function* exploreAndCollectFullDirectoryInfo(
    directoryPath: string,
): AsyncIterable<TarStreamInput> {
    for await (
        const entry of walk(directoryPath, {
            includeFiles: true,
            includeSymlinks: false,
            includeDirs: true,
            followSymlinks: false,
        })
    ) {
        if (entry.isFile) {
            yield {
                type: 'file',
                path: relative(directoryPath, entry.path),
                size: (await Deno.stat(entry.path)).size,
                readable: (await Deno.open(entry.path)).readable,
            };
        } else if (entry.isDirectory) {
            yield {
                type: 'directory',
                path: relative(directoryPath, entry.path),
            };
        }
    }
}

export function streamDirectoryAsTarGzip(directoryPath: string): ReadableStream {
    const tarStream: ReadableStream = ReadableStream.from<TarStreamInput>(
        exploreAndCollectFullDirectoryInfo(directoryPath),
    )
        .pipeThrough(new TarStream());
    return tarStream.pipeThrough(new CompressionStream('gzip'));
}
