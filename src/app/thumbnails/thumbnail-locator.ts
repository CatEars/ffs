import { relative } from '@std/path/relative';
import { sleep } from '../../lib/sleep/sleep.ts';
import { getCacheRoot } from '../config.ts';
import { getThumbnailPath, getThumbnailsDir } from '../files/cache-folder.ts';
import { FileTree } from '../files/file-tree.ts';
import { canGenerateThumbnailFor } from './generate-thumbnail.ts';
import { prioritizeThumbnail } from './index.ts';
import { ThumbnailResult } from './types.ts';

async function tryGetFile(fileTree: FileTree, filePath: string) {
    for (let cnt = 0; cnt < 20; ++cnt) {
        if (await fileTree.exists(filePath)) {
            return true;
        }
        await sleep(200);
    }
    return false;
}

async function waitUntilFilepathExistsOrBail(
    fileTree: FileTree,
    filePath: string,
) {
    const race = Promise.race([tryGetFile(fileTree, filePath), sleep(5050)]);
    try {
        const res = await race;
        return !!res;
    } catch {
        return false;
    }
}

class ThumbnailLocator {
    private cacheFileTree: FileTree;

    constructor() {
        this.cacheFileTree = new FileTree(getCacheRoot());
    }

    async getThumbnail(searchObjectFullPath: string): Promise<ThumbnailResult> {
        let isDirectory = false;
        try {
            const stat = await Deno.stat(searchObjectFullPath);
            isDirectory = stat.isDirectory;
        } catch {
            // File disappeared or does not exist, dont hand them a thumbnail for that >:(
            return {
                type: 'thumbnail-not-found',
            };
        }

        if (!isDirectory && !canGenerateThumbnailFor(searchObjectFullPath)) {
            return { type: 'thumbnail-not-found' };
        }

        const thumbnailPath = getThumbnailPath(searchObjectFullPath);
        const thumbnailExists = await this.cacheFileTree.exists(thumbnailPath);
        if (!thumbnailExists) {
            prioritizeThumbnail(searchObjectFullPath);
            const generated = await waitUntilFilepathExistsOrBail(
                this.cacheFileTree,
                thumbnailPath,
            );
            if (!generated) {
                return { type: 'thumbnail-not-found' };
            }
        }

        const thumbnailsDir = getThumbnailsDir();
        return {
            type: 'thumbnail-found',
            root: thumbnailsDir,
            path: relative(thumbnailsDir, thumbnailPath),
        };
    }
}

export const thumbnailLocator = new ThumbnailLocator();
