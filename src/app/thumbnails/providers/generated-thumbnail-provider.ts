import { relative } from '@std/path/relative';
import { Context } from '@oak/oak/context';
import { FfsApplicationState } from '../../application-state.ts';
import { getCacheRoot } from '../../config.ts';
import { getThumbnailPath } from '../../files/cache-folder.ts';
import { FileTree } from '../../files/file-tree.ts';
import { sleep } from '../../../lib/sleep/sleep.ts';
import { canGenerateThumbnailFor } from '../generate-thumbnail.ts';
import { prioritizeThumbnail } from '../index.ts';
import { ThumbnailProvider } from '../thumbnail-provider.ts';

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

export class GeneratedThumbnailProvider implements ThumbnailProvider {
    private cacheFileTree: FileTree;

    constructor() {
        this.cacheFileTree = new FileTree(getCacheRoot());
    }

    async handle(
        ctx: Context<FfsApplicationState>,
        resolvedFullPath: string,
        isDirectory: boolean,
    ): Promise<boolean> {
        if (!isDirectory && !canGenerateThumbnailFor(resolvedFullPath)) {
            return false;
        }

        const thumbnailPath = getThumbnailPath(resolvedFullPath);
        const thumbnailExists = await this.cacheFileTree.exists(thumbnailPath);
        if (!thumbnailExists) {
            prioritizeThumbnail(resolvedFullPath);
            const generated = await waitUntilFilepathExistsOrBail(
                this.cacheFileTree,
                thumbnailPath,
            );
            if (!generated) {
                return false;
            }
        }

        await ctx.send({
            path: relative(getCacheRoot(), thumbnailPath),
            root: getCacheRoot(),
        });
        return true;
    }
}
