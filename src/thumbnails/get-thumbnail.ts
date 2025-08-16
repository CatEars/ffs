import { Router } from '@oak/oak';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { getCacheRoot } from '../config.ts';
import { canGenerateThumbnailFor } from './generate-thumbnail.ts';
import { prioritizeThumbnail } from './index.ts';
import { withThumbnailExtension } from '../files/cache-folder.ts';
import { sleep } from '../utils/sleep.ts';
import {
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
} from '../utils/http-codes.ts';
import { FileTree } from '../files/file-tree.ts';

async function tryGetFile(fileTree: FileTree, filePath: string) {
    for (let cnt = 0; cnt < 20; ++cnt) {
        if (fileTree.exists(filePath)) {
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

export function registerGetThumbnail(router: Router) {
    const cacheRoot = getCacheRoot();
    const cacheFileTree = new FileTree(cacheRoot);

    router.get('/api/thumbnail', baseMiddlewares(), ...protectedMiddlewares(), async (ctx) => {
        const storeFileTree = ctx.state.fileTree;
        const path = ctx.request.url.searchParams.get('path');
        if (!path || !canGenerateThumbnailFor(path)) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }

        const pathExistResult = storeFileTree.resolvePath(path);
        if (pathExistResult.type === 'invalid') {
            ctx.response.status = HTTP_403_FORBIDDEN;
            return;
        }

        const thumbnailPath = withThumbnailExtension(path);
        if (!cacheFileTree.exists(thumbnailPath)) {
            const actualPath = pathExistResult.fullPath;
            await prioritizeThumbnail(actualPath);
            const generatedThumbnail = await waitUntilFilepathExistsOrBail(
                cacheFileTree,
                thumbnailPath,
            );
            if (!generatedThumbnail) {
                ctx.response.status = HTTP_404_NOT_FOUND;
                return;
            }
        }

        await ctx.send({
            path: path + '.webp',
            root: cacheRoot,
        });
    });
}
