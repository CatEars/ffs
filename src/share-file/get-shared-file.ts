import { Router } from '@oak/oak/router';
import { baseMiddlewares } from '../base-middlewares.ts';
import { shareProtect } from '../security/share-protect.ts';
import { decodeBase64Url } from 'jsr:@std/encoding@^1.0.10/base64url';
import { HTTP_400_BAD_REQUEST } from '../utils/http-codes.ts';
import { getStoreRoot } from '../config.ts';

export function registerGetSharedFilesRoutes(router: Router) {
    router.get('/api/share-file/download', baseMiddlewares(), shareProtect, async (ctx) => {
        const paths = JSON.parse(decodeBase64Url(ctx.request.url.searchParams.get('paths') || ''));
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
