import { Router } from '@oak/oak/router';
import { basename } from '@std/path/basename';
import { join } from '@std/path/join';
import {
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
    HTTP_500_INTERNAL_SERVER_ERROR,
} from '../../../lib/http/http-codes.ts';
import { setDownloadedFilename } from '../../../lib/http/set-filename.ts';
import { sendDirectory } from '../../../lib/send-directory/send-directory.ts';
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
        const fullPath = join(getStoreRoot(), path);
        const stat = await Deno.stat(fullPath);
        if (stat.isDirectory) {
            sendDirectory(ctx, path, { root: getStoreRoot() });
        } else if (stat.isFile) {
            setDownloadedFilename(ctx, basename(path));
            await ctx.send({
                root: getStoreRoot(),
                path,
            });
        } else {
            ctx.response.status = HTTP_403_FORBIDDEN;
        }
    });
}
