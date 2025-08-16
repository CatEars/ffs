import { Router } from '@oak/oak/router';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { FfsApplicationState } from '../user-config/index.ts';

export function registerFileRoutes(router: Router<FfsApplicationState>) {
    router.get('/api/file', baseMiddlewares(), ...protectedMiddlewares(), async (ctx) => {
        const fileTree = ctx.state.fileTree;
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
