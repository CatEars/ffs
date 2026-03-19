import { Router } from '@oak/oak/router';
import {
    HTTP_400_BAD_REQUEST,
    HTTP_500_INTERNAL_SERVER_ERROR,
} from '../../../lib/http/http-codes.ts';
import { baseMiddlewares } from '../../base-middlewares.ts';
import { getStoreRoot } from '../../config.ts';
import { shareLinkSchemeRegistry } from '../../share-file/share-link-scheme-registry.ts';
import { shareProtect } from '../../share-file/share-protect.ts';

export function register(router: Router) {
    router.get('/api/share-file/download', baseMiddlewares(), shareProtect, async (ctx) => {
        if (!ctx.state.pathCode) {
            ctx.response.status = HTTP_500_INTERNAL_SERVER_ERROR;
            return;
        }
        const { paths } = await shareLinkSchemeRegistry.decodeCode(ctx.state.pathCode);
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
