import { Router } from '@oak/oak/router';
import { baseMiddlewares } from '../base-middlewares.ts';
import { shareProtect } from './share-protect.ts';
import { HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR } from '../utils/http-codes.ts';
import { getStoreRoot } from '../config.ts';
import { shareLinkSchemeRegistry } from './share-link-scheme-registry.ts';

export function registerGetSharedFilesRoutes(router: Router) {
    router.get('/api/share-file/list', baseMiddlewares(), shareProtect, (ctx) => {
        if (!ctx.state.pathCode) {
            ctx.response.status = HTTP_500_INTERNAL_SERVER_ERROR;
            return;
        }
        const { paths } = shareLinkSchemeRegistry.decodeCode(ctx.state.pathCode);
        if (!paths) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }
        ctx.response.body = paths;
    });

    router.get('/api/share-file/download', baseMiddlewares(), shareProtect, async (ctx) => {
        if (!ctx.state.pathCode) {
            ctx.response.status = HTTP_500_INTERNAL_SERVER_ERROR;
            return;
        }
        const { paths } = shareLinkSchemeRegistry.decodeCode(ctx.state.pathCode);
        const index = Number.parseInt(ctx.request.url.searchParams.get('index') || '');
        if (!paths || (typeof index !== 'number') || isNaN(index) || !paths[index]) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }

        const path = paths[index];
        await ctx.send({
            root: getStoreRoot(),
            path,
        });
    });
}
