import { Router } from '@oak/oak';
import { HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND } from '../../../lib/http/http-codes.ts';
import { sendDirectory } from '../../../lib/send-directory/send-directory.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { manifestRegistry } from '../../download/manifest.ts';

export function register(router: Router) {
    router.get(
        '/api/download/directory',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        async (ctx) => {
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

            if (!fileToSend.isDirectory) {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                return;
            }

            sendDirectory(ctx, fileToSend.name, {
                root: fileToSend.directoryPath,
            });
        },
    );
}
