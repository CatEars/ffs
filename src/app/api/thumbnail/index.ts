import { Router } from '@oak/oak';
import { relative } from '@std/path/relative';
import {
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
} from '../../../lib/http/http-codes.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { getThumbnailsDir } from '../../files/cache-folder.ts';
import { getThumbnailLocationQuicklyOrNull } from '../../thumbnails/worker/index.ts';

export function register(router: Router) {
    router.get('/api/thumbnail', baseMiddlewares(), ...protectedMiddlewares(), async (ctx) => {
        const storeFileTree = ctx.state.fileTree;
        const pathFromUrl = ctx.request.url.searchParams.get('path');
        if (!pathFromUrl) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }

        const path = decodeURIComponent(pathFromUrl);
        const pathExistResult = await storeFileTree.resolvePath(path);
        if (pathExistResult.type === 'invalid') {
            ctx.response.status = HTTP_403_FORBIDDEN;
            return;
        }

        const result = await getThumbnailLocationQuicklyOrNull(pathExistResult.fullPath);

        if (!result || result.type !== 'thumbnail-found') {
            ctx.response.status = HTTP_404_NOT_FOUND;
            return;
        } else {
            const root = getThumbnailsDir();
            const path = relative(root, result.path);
            await ctx.send({ root, path });
        }
    });
}
