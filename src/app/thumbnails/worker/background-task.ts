import { resolve } from '@std/path/resolve';
import { MemoryCache } from '../../../lib/cache/memory-cache.ts';
import { Channel } from '../../../lib/channel/channel.ts';
import { FileTreeWalker } from '../../../lib/file-system/file-tree-walker.ts';
import { WorkerRpc } from '../../../lib/worker-rpc/worker-rpc.ts';
import {
    devModeEnabled,
    getCacheRoot,
    getStoreRoot,
    getThumbnailFinderSkipRegex,
} from '../../config.ts';
import { getThumbnailPath, thumbnailExists } from '../../files/cache-folder.ts';
import { logger } from '../../logging/loggers.ts';
import { ThumbnailRequest, ThumbnailWorkerRequest, ThumbnailWorkerResponse } from '../types.ts';
import {
    canGenerateThumbnailFor,
    ensureNailersUpToDate,
    generateThumbnail,
} from './generate-thumbnail.ts';
import { areThumbnailsAvailable } from './index.ts';

let activated = false;
const fiveMinutes = 1000 * 60 * 5;
const recentlyParsedThumbnails = new MemoryCache<[string | null]>(
    fiveMinutes,
);
const filesToPrioritizeChannel: Channel<ThumbnailRequest> = new Channel();

const MAX_CHANNEL_ENTRIES = 2500;
let fileWalkerGenerator: AsyncGenerator<ThumbnailRequest> | null = null;
let dirWalkerGenerator: AsyncGenerator<ThumbnailRequest> | null = null;
let isFillFilesRunning = false;
let isFillDirsRunning = false;

function buildFileTreeOptions() {
    const fileTreeOptions = {
        skip: [] as RegExp[],
    };
    const thumbnailSkipPattern = getThumbnailFinderSkipRegex();
    if (thumbnailSkipPattern) {
        fileTreeOptions.skip.push(new RegExp(thumbnailSkipPattern));
    }
    return fileTreeOptions;
}

async function* walkFiles(): AsyncGenerator<ThumbnailRequest> {
    const storeRoot = getStoreRoot();
    const fileTreeWalker = new FileTreeWalker(storeRoot, {
        ...buildFileTreeOptions(),
        includeFiles: true,
        includeDirs: false,
        includeSymlinks: false,
    });
    fileTreeWalker.filter((file) =>
        canGenerateThumbnailFor(file.path) && !thumbnailExists(file.path)
    );
    for await (const file of fileTreeWalker.walk()) {
        yield { filePath: resolve(storeRoot, '.' + file.parent, file.name) };
    }
}

async function* walkDirs(): AsyncGenerator<ThumbnailRequest> {
    const storeRoot = getStoreRoot();
    const fileTreeWalker = new FileTreeWalker(storeRoot, {
        ...buildFileTreeOptions(),
        includeFiles: false,
        includeDirs: true,
        includeSymlinks: false,
    });
    fileTreeWalker.filter((file) => !thumbnailExists(file.path));
    for await (const directory of fileTreeWalker.walk()) {
        yield { filePath: resolve(storeRoot, '.' + directory.parent, directory.name) };
    }
}

async function fillFilesIntoChannel() {
    if (!activated || isFillFilesRunning) {
        return;
    }
    isFillFilesRunning = true;
    try {
        if (!fileWalkerGenerator) {
            fileWalkerGenerator = walkFiles();
        }
        const generator = fileWalkerGenerator;
        while (activated && filesToPrioritizeChannel.size < MAX_CHANNEL_ENTRIES) {
            const result = await generator.next();
            if (result.done) {
                if (fileWalkerGenerator === generator) {
                    fileWalkerGenerator = null;
                }
                break;
            }
            filesToPrioritizeChannel.push(result.value);
        }
    } finally {
        isFillFilesRunning = false;
    }
}

async function fillDirsIntoChannel() {
    if (!activated || isFillDirsRunning) {
        return;
    }
    isFillDirsRunning = true;
    try {
        if (!dirWalkerGenerator) {
            dirWalkerGenerator = walkDirs();
        }
        const generator = dirWalkerGenerator;
        while (activated && filesToPrioritizeChannel.size < MAX_CHANNEL_ENTRIES) {
            const result = await generator.next();
            if (result.done) {
                if (dirWalkerGenerator === generator) {
                    dirWalkerGenerator = null;
                }
                break;
            }
            filesToPrioritizeChannel.push(result.value);
        }
    } finally {
        isFillDirsRunning = false;
    }
}

const me: Worker = self as unknown as Worker;

async function getThumbnail(next: ThumbnailRequest) {
    if (!activated) {
        return null;
    }

    const recentlyParsed = recentlyParsedThumbnails.get(next.filePath);
    if (recentlyParsed) {
        const [loc] = recentlyParsed;
        if (loc) {
            return loc;
        } else {
            return null;
        }
    }

    if (thumbnailExists(next.filePath)) {
        return getThumbnailPath(next.filePath);
    }

    try {
        const thumbnailPath = await generateThumbnail(next);
        recentlyParsedThumbnails.set(next.filePath, [thumbnailPath]);
        return thumbnailPath;
    } catch (err) {
        logger.debug(
            'Failed to generate thumbnail for',
            next,
            'Skipping. error:',
            err,
        );
    }
}

async function main() {
    logger.debug(
        'Background task for thumbnail generation started. Storing thumbnails in cache at',
        getCacheRoot(),
    );

    if (!me) {
        logger.debug(
            'Thumbnail worker does not hold reference to self, unable to set up communication',
        );
        return;
    }

    const rpc = WorkerRpc.buildFromWorker<ThumbnailWorkerRequest, ThumbnailWorkerResponse>(me);
    rpc.on('create-thumbnail', (msg) => {
        if (msg.type === 'create-thumbnail') {
            filesToPrioritizeChannel.pushFirst(msg);
        }
    });

    rpc.on('activate', (_) => {
        activated = true;
        logger.info('Background task for generating thumbnails activated');
    });

    rpc.on('deactivate', (_) => {
        activated = false;
        fileWalkerGenerator = null;
        dirWalkerGenerator = null;
        logger.info('Background task for generating thumbnails deactivated');
    });

    await ensureNailersUpToDate();
    setInterval(async () => {
        await ensureNailersUpToDate();
    }, 60_000);
    setInterval(() => recentlyParsedThumbnails.prune(), fiveMinutes);

    if (await areThumbnailsAvailable()) {
        await fillFilesIntoChannel();
        await fillDirsIntoChannel();
        setInterval(fillFilesIntoChannel, devModeEnabled ? 10_000 : 60_000);
        setInterval(fillDirsIntoChannel, devModeEnabled ? 10_000 : 60_000);
    }

    while (true) {
        const next = await filesToPrioritizeChannel.consume();
        if (next === null) {
            continue;
        }

        const thumbnailPath = await getThumbnail(next);
        if (next.id) {
            if (thumbnailPath) {
                rpc.post({
                    type: 'thumbnail-found',
                    path: thumbnailPath,
                    id: next.id || '',
                });
            } else {
                rpc.post({
                    type: 'thumbnail-not-found',
                    id: next.id || '',
                });
            }
        }
    }
}

if (import.meta.main) {
    main()
        .catch((err) => {
            logger.warn(err);
        });
}
