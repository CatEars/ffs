import * as path from '@std/path';
import { Router } from '@oak/oak/router';
import { getStoreRoot } from '../config.ts';
import { HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND } from '../utils/http-codes.ts';
import { baseMiddlewares } from '../base-middlewares.ts';
import { apiProtect } from '../security/api-protect.ts';
import { FileTree } from '../files/file-tree.ts';
import { logger } from '../logging/logger.ts';

export function registerUploadFileRoute(router: Router) {
    const fileTree = new FileTree(getStoreRoot());

    router.post(
        '/api/file/upload',
        baseMiddlewares(),
        apiProtect,
        async (ctx) => {
            const data = await ctx.request.body.formData();
            const directory = data.get('directory')?.toString() || getStoreRoot();
            const file = data.get('file');

            if (!(file instanceof File)) {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                return;
            }
            const name = file.name;
            const listing = fileTree.listDirectory(directory);
            if (listing.type === 'none') {
                ctx.response.status = HTTP_404_NOT_FOUND;
                return;
            }

            const targetFile = fileTree.resolvePath(directory, file.name);
            if (targetFile.type === 'invalid') {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                return;
            }

            const extName = path.extname(name);
            let fileName = path.basename(targetFile.fullPath);
            while (listing.files.some((x) => x.name === fileName)) {
                fileName = fileName.substring(0, fileName.length - extName.length) +
                    ' Copy' + extName;
            }

            const directoryPath = path.dirname(targetFile.fullPath);
            const finalPath = path.resolve(directoryPath, fileName);
            logger.info(`Uploading file to ${finalPath}`);
            await Deno.writeFile(finalPath, file.stream());
            ctx.response.redirect(
                ctx.request.headers.get('Referer') || '/file-manager/',
            );
        },
    );
}
