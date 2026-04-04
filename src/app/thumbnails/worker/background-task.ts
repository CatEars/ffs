import { resolve } from '@std/path/resolve';
import { MemoryCache } from '../../../lib/cache/memory-cache.ts';
import { FileTreeWalker } from '../../../lib/file-system/file-tree-walker.ts';
import { sleep } from '../../../lib/sleep/sleep.ts';
import {
    devModeEnabled,
    getCacheRoot,
    getStoreRoot,
    getThumbnailFinderSkipRegex,
} from '../../config.ts';
import { getThumbnailPath, thumbnailExists } from '../../files/cache-folder.ts';
import { logger } from '../../logging/loggers.ts';
import { ThumbnailRequest, ThumbnailWorkerRequest, ThumbnailWorkerResponse } from '../types.ts';
import { canGenerateThumbnailFor, generateThumbnail } from './generate-thumbnail.ts';
import { areThumbnailsAvailable } from './index.ts';

let activated = false;
const filesToPrioritize: ThumbnailRequest[] = [];
const fiveMinutes = 1000 * 60 * 5;
const recentlyParsedThumbnails = new MemoryCache<[ThumbnailRequest, string | null]>(
    fiveMinutes,
);

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
    if (!activated) {
        return;
    }
    const storeRoot = getStoreRoot();
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
    if (!activated) {
        return;
    }
    const storeRoot = getStoreRoot();
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

const me: Worker = self as unknown as Worker;

function doPost(message: ThumbnailWorkerResponse) {
    if (me) {
        me.postMessage(message);
    }
}

async function main() {
    logger.debug(
        'Background task for thumbnail generation started. Storing thumbnails in cache at',
        getCacheRoot(),
    );

    if (me) {
        me.onmessage = (event: MessageEvent<ThumbnailWorkerRequest>) => {
            if (event.data.type === 'create-thumbnail') {
                // Always push prioritized requests to top. Let those found on own be at end
                filesToPrioritize.splice(0, 0, event.data);
            } else if (event.data.type === 'activate') {
                activated = true;
                logger.info('Background task for generating thumbnails activated');
            } else if (event.data.type === 'deactivate') {
                activated = false;
                logger.info('Background task for generating thumbnails deactivated');
            } else if (event.data.type === 'echo') {
                doPost({
                    type: 'echo',
                });
            }
        };
    }

    const isSelfAvailable = areThumbnailsAvailable();
    if (!isSelfAvailable) {
        logger.debug(
            'Background task for thumbnails turning itself off since ffmpeg and image magick are not available',
        );
        return;
    }

    await findFilesToThumbnail();
    await findDirectoriesToThumbnail();
    setInterval(findFilesToThumbnail, devModeEnabled ? 10_000 : 60_000);
    setInterval(findDirectoriesToThumbnail, devModeEnabled ? 10_000 : 60_000);

    let consecutiveNothings = 0;
    while (true) {
        while (filesToPrioritize.length > 0) {
            consecutiveNothings = 0;
            const next = filesToPrioritize.splice(0, 1)[0];
            if (!activated) {
                if (next.id) {
                    doPost({
                        type: 'thumbnail-not-found',
                        id: next.id,
                    });
                }
                continue;
            }

            const recentlyParsed = recentlyParsedThumbnails.get(next.filePath);
            if (recentlyParsed) {
                if (next.id) {
                    const [, loc] = recentlyParsed;
                    if (loc !== null) {
                        doPost({
                            type: 'thumbnail-found',
                            id: next.id,
                            path: loc,
                        });
                    } else {
                        doPost({
                            type: 'thumbnail-not-found',
                            id: next.id,
                        });
                    }
                }
                continue;
            }

            if (thumbnailExists(next.filePath)) {
                if (next.id) {
                    const filePath = getThumbnailPath(next.filePath);
                    doPost({
                        type: 'thumbnail-found',
                        id: next.id,
                        path: filePath,
                    });
                }
                continue;
            }

            try {
                const thumbnailPath = await generateThumbnail(next);
                if (next.id && thumbnailPath) {
                    doPost({
                        type: 'thumbnail-found',
                        id: next.id,
                        path: thumbnailPath,
                    });
                } else if (next.id && !thumbnailPath) {
                    doPost({
                        type: 'thumbnail-not-found',
                        id: next.id,
                    });
                }
                recentlyParsedThumbnails.set(next.filePath, [next, thumbnailPath]);
            } catch (err) {
                logger.debug(
                    'Failed to generate thumbnail for',
                    next,
                    'Skipping. error:',
                    err,
                );
            }
        }

        if (consecutiveNothings > 50) {
            await sleep(200);
        } else {
            consecutiveNothings++;
        }
        await sleep(1);
    }
}

if (import.meta.main) {
    main()
        .catch((err) => {
            logger.warn(err);
        });
}
