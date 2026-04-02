import { Router } from '@oak/oak';
import { HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN, HTTP_404_NOT_FOUND } from '../../../lib/http/http-codes.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { thumbnailProviderChain } from '../../thumbnails/module.ts';

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

        let isDirectory = false;
        if (pathExistResult.exists) {
            try {
                const stat = await Deno.stat(pathExistResult.fullPath);
                isDirectory = stat.isDirectory;
            } catch {
                // File disappeared between resolvePath and stat; treat as file
            }
        }

        const result = await thumbnailProviderChain.resolve({ resolvedFullPath: pathExistResult.fullPath, isDirectory });
        if (result.type === 'ThumbnailNotFound') {
            ctx.response.status = HTTP_404_NOT_FOUND;
            return;
        }

        await ctx.send({ root: result.root, path: result.path });
    });
}
