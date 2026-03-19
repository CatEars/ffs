import { resolve } from '@std/path/resolve';
import { MemoryCache } from '../../lib/cache/memory-cache.ts';
import { IpcPipe } from '../../lib/ipc-pipe/pipe.ts';
import { sleep } from '../../lib/sleep/sleep.ts';
import {
    devModeEnabled,
    getCacheRoot,
    getStoreRoot,
    getThumbnailFinderSkipRegex,
} from '../config.ts';
import { thumbnailExists } from '../files/cache-folder.ts';
import { FileTreeWalker } from '../../lib/file-system/file-tree-walker.ts';
import { logger } from '../logging/loggers.ts';
import { canGenerateThumbnailFor, generateThumbnail } from './generate-thumbnail.ts';
import { ThumbnailRequest } from './types.ts';

const cacheRoot = getCacheRoot();
const storeRoot = getStoreRoot();
logger.skipPrefix();
logger.info(
    'Background task for thumbnail generation started. Storing thumbnails in cache at',
    cacheRoot,
);

const filesToPrioritize: ThumbnailRequest[] = [];
const fiveMinutes = 1000 * 60 * 5;
const recentlyParsedThumbnails = new MemoryCache<ThumbnailRequest>(fiveMinutes);

function buildFileTreeOptions() {
    const fileTreeOptions = {
        skip: [] as RegExp[],
    };
    const thumbnailSkipPattern = getThumbnailFinderSkipRegex();
    if (thumbnailSkipPattern) {
        fileTreeOptions.skip.push(new RegExp(thumbnailSkipPattern, 'g'));
    }
    return fileTreeOptions;
}

async function findFilesToThumbnail() {
    const fileTreeOptions = buildFileTreeOptions();
    const fileTreeWalker = new FileTreeWalker(storeRoot, {
        ...fileTreeOptions,
        includeFiles: true,
        includeDirs: false,
        includeSymlinks: false,
    });

    fileTreeWalker.filter((file) =>
        canGenerateThumbnailFor(file.path) && !thumbnailExists(file.path)
    );

    for await (const file of fileTreeWalker.walk()) {
        filesToPrioritize.push({
            filePath: resolve(storeRoot, '.' + file.parent, file.name),
            isFile: true,
            isDirectory: false,
        });
    }
}

async function findDirectoriesToThumbnail() {
    const fileTreeOptions = buildFileTreeOptions();
    const fileTreeWalker = new FileTreeWalker(storeRoot, {
        ...fileTreeOptions,
        includeFiles: false,
        includeDirs: true,
        includeSymlinks: false,
    });

    fileTreeWalker.filter((file) => !thumbnailExists(file.path));

    for await (const directory of fileTreeWalker.walk()) {
        filesToPrioritize.push({
            filePath: resolve(storeRoot, '.' + directory.parent, directory.name),
            isFile: false,
            isDirectory: true,
        });
    }
}

const thumbnailIpcPipe = new IpcPipe('thumbnail', logger);
thumbnailIpcPipe.listenToStdin();
thumbnailIpcPipe.on('thumbnail-prioritize', (request: ThumbnailRequest) => {
    // Always push STDIN requests to top. Let those found on own be at end
    filesToPrioritize.splice(0, 0, request);
});

await findFilesToThumbnail();
await findDirectoriesToThumbnail();
setInterval(findFilesToThumbnail, devModeEnabled ? 10_000 : 60_000);
setInterval(findDirectoriesToThumbnail, devModeEnabled ? 10_000 : 60_000);

while (true) {
    while (filesToPrioritize.length > 0) {
        const next = filesToPrioritize.splice(0, 1)[0];
        if (
            recentlyParsedThumbnails.get(next.filePath) ||
            thumbnailExists(next.filePath)
        ) {
            continue;
        }
        try {
            await generateThumbnail(next);
        } catch (err) {
            logger.debug(
                'Failed to generate thumbnail for',
                next,
                'Skipping. error:',
                err,
            );
        }

        recentlyParsedThumbnails.set(next.filePath, next);
    }
    await sleep(500);
}
