import { Router } from '@oak/oak';
import { send } from '@oak/oak/send';
import { join } from '@std/path/join';
import { HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND } from '../../../lib/http/http-codes.ts';
import { baseMiddlewares } from '../../base-middlewares.ts';
import { manifestRegistry } from '../../download/manifest.ts';

export function register(router: Router) {
    router.get('/api/download/file', baseMiddlewares(), async (ctx) => {
        const manifestId = ctx.request.url.searchParams.get('manifestId');
        const fileIndex = ctx.request.url.searchParams.get('fileIndex');
        const parsedIndex = Number.parseInt(fileIndex || '');
        if (!manifestId || Number.isNaN(parsedIndex)) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }

        const manifest = await manifestRegistry.getManifest(manifestId);
        const fileToSend = (manifest || { files: [] }).files[parsedIndex];
        if (!manifest || !fileToSend) {
            ctx.response.status = HTTP_404_NOT_FOUND;
            return;
        }

        if (!fileToSend.isFile) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }

        const filePath = join(fileToSend.directoryPath, fileToSend.name);
        await send(ctx, filePath, {
            root: fileToSend.directoryPath,
            gzip: true,
        });
    });
}
