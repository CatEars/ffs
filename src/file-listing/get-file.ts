import { Router } from '@oak/oak/router';
import { apiProtect } from '../security/api-protect.ts';
import { baseMiddlewares } from '../base-middlewares.ts';
import { getRootFileTree } from './resolve-file-tree.ts';

export function registerFileRoutes(router: Router) {
    const fileTree = getRootFileTree();

    router.get('/api/file', baseMiddlewares(), apiProtect, async (ctx) => {
        const path = ctx.request.url.searchParams.get('path');
        if (!path) {
            ctx.response.status = 404;
            return;
        }

        await ctx.send({
            path,
            root: fileTree.rootPath(),
        });
    });
}
