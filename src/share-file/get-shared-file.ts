import { Router } from '@oak/oak/router';
import { decodeBase64Url } from '@std/encoding/base64url';
import { baseMiddlewares } from '../base-middlewares.ts';
import { shareProtect } from './share-protect.ts';
import { HTTP_400_BAD_REQUEST } from '../utils/http-codes.ts';
import { getStoreRoot } from '../config.ts';

const decoder = new TextDecoder();

export function registerGetSharedFilesRoutes(router: Router) {
    router.get('/api/share-file/list', baseMiddlewares(), shareProtect, (ctx) => {
        const x = decoder.decode(decodeBase64Url(ctx.request.url.searchParams.get('paths') || ''));
        const paths = JSON.parse(x);
        if (!paths) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }
        ctx.response.body = paths;
    });

    router.get('/api/share-file/download', baseMiddlewares(), shareProtect, async (ctx) => {
        const pathsUnparsed = decoder.decode(
            decodeBase64Url(ctx.request.url.searchParams.get('paths') || ''),
        );
        const paths = JSON.parse(pathsUnparsed);
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
