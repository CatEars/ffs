import { Router } from '@oak/oak';
import {
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
} from '../../../lib/http/http-codes.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { thumbnailLocator } from '../../thumbnails/thumbnail-locator.ts';

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

        const result = await thumbnailLocator.getThumbnail(pathExistResult.fullPath);

        if (result.type === 'thumbnail-not-found') {
            ctx.response.status = HTTP_404_NOT_FOUND;
            return;
        } else {
            await ctx.send({ root: result.root, path: result.path });
        }
    });
}
