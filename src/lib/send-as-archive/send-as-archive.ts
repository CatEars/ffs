import { Context } from '@oak/oak';
import { basename } from '@std/path/basename';
import { TarStream, TarStreamInput } from '@std/tar/tar-stream';
import { resolveUnder } from '../ensure-under/ensure-under.ts';
import { setDownloadedFilename } from '../http/set-filename.ts';
import { Logger } from '../logger/logger.ts';
import { exploreAndCollectFullDirectoryInfo } from '../send-directory/directory-stream.ts';

export type SendAsArchiveOptions = {
    root: string;
    logger?: Logger;
};

async function* sendDependingOnFileType(
    filePaths: string[],
    options: SendAsArchiveOptions,
): AsyncIterable<TarStreamInput> {
    const validPaths = filePaths
        .map((x) => resolveUnder(x, options.root))
        .filter((x) => x != null);

    for (const path of validPaths) {
        const stat = await Deno.stat(path);
        if (stat.isDirectory) {
            yield* exploreAndCollectFullDirectoryInfo(path, basename(path) + '/');
        } else if (stat.isFile) {
            yield {
                type: 'file',
                path: basename(path),
                size: stat.size,
                readable: (await Deno.open(path)).readable,
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

export function sendAsArchive(ctx: Context, filePaths: string[], options: SendAsArchiveOptions) {
    options.logger?.log(
        'Creating on the fly archive and downloading:',
        filePaths,
        'from',
        options.root,
    );

    setDownloadedFilename(ctx, basename(options.root) + '.tar.gz');

    const tarStream: ReadableStream = ReadableStream.from<TarStreamInput>(
        sendDependingOnFileType(filePaths, options),
    )
        .pipeThrough(new TarStream());
    const stream = tarStream.pipeThrough(new CompressionStream('gzip'));
    ctx.response.type = 'application/gzip';
    ctx.response.body = stream;
}
