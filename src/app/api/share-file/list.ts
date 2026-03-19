import { Router } from '@oak/oak/router';
import {
    HTTP_400_BAD_REQUEST,
    HTTP_500_INTERNAL_SERVER_ERROR,
} from '../../../lib/http/http-codes.ts';
import { baseMiddlewares } from '../../base-middlewares.ts';
import { shareLinkSchemeRegistry } from '../../share-file/share-link-scheme-registry.ts';
import { shareProtect } from '../../share-file/share-protect.ts';

export function register(router: Router) {
    router.get('/api/share-file/list', baseMiddlewares(), shareProtect, async (ctx) => {
        if (!ctx.state.pathCode) {
            ctx.response.status = HTTP_500_INTERNAL_SERVER_ERROR;
            return;
        }
        const { paths } = await shareLinkSchemeRegistry.decodeCode(ctx.state.pathCode);
        if (!paths) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }
        ctx.response.body = paths;
    });
}
