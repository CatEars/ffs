import { Router } from '@oak/oak';
import { join } from '@std/path/join';
import { basename } from 'node:path';
import {
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_404_NOT_FOUND,
    HTTP_500_INTERNAL_SERVER_ERROR,
} from '../../../lib/http/http-codes.ts';
import { resolveUnder } from '../../../lib/resolve-under/resolve-under.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { getUploadDir } from '../../files/cache-folder.ts';
import { logger } from '../../logging/loggers.ts';
import { csrfProtect } from '../../security/csrf-protect.ts';

type UploadBooking = {
    directory: string;
    fileName: string;
    tempFile: string;
};

export function register(router: Router) {
    const apiTokens = new Map<string, UploadBooking>();
    router.post(
        '/api/upload/book',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        csrfProtect,
        async (ctx) => {
            const data = await ctx.request.body.json();
            const { directory, fileName } = data;
            if (!directory || !fileName) {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                return;
            }

            const dirExists = await ctx.state.fileTree.exists(directory);
            if (!dirExists) {
                ctx.response.status = HTTP_404_NOT_FOUND;
                return;
            }
            const fullPath = join(directory, fileName);
            const statResult = await ctx.state.fileTree.resolvePath(fullPath);
            if (statResult.type === 'invalid') {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                return;
            }

            const resolvedPathUnderFileTree = statResult.fullPath;
            if (!resolveUnder(fileName, basename(resolvedPathUnderFileTree))) {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                return;
            }

            const authToken = crypto.randomUUID();
            const cacheDir = join(getUploadDir(), authToken);
            const tempFile = join(cacheDir, fileName);
            await Deno.mkdir(cacheDir);
            const f = await Deno.open(tempFile, { createNew: true, write: true });
            f.close();

            apiTokens.set(authToken, {
                directory,
                fileName,
                tempFile,
            });
            logger.info('Created upload booking for', fileName, 'to', directory);
            ctx.response.body = {
                authToken,
            };
        },
    );

    // No logging as big files will call this endpoint MANY times
    // Auth extended by token created earlier
    router.post('/api/upload/chunk', async (ctx) => {
        const token = ctx.request.url.searchParams.get('token') || '';
        const booking = apiTokens.get(token);

        if (!booking) {
            ctx.response.status = HTTP_401_UNAUTHORIZED;
            return;
        }

        const tempFile = booking.tempFile;
        const appendData = await ctx.request.body.blob();
        await Deno.writeFile(tempFile, appendData.stream(), {
            append: true,
        });

        ctx.response.status = HTTP_200_OK;
    });

    router.post(
        '/api/upload/commit',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        csrfProtect,
        async (ctx) => {
            const { token } = await ctx.request.body.json();
            const booking = apiTokens.get(token);
            if (!booking) {
                ctx.response.status = HTTP_404_NOT_FOUND;
                return;
            }

            const targetPath = await ctx.state.fileTree.resolvePath(
                join(booking.directory, booking.fileName),
            );
            if (targetPath.type === 'invalid') {
                ctx.response.status = HTTP_404_NOT_FOUND;
                return;
            }

            try {
                await Deno.rename(booking.tempFile, targetPath.fullPath);
                logger.info('Uploaded', booking.fileName, 'to', booking.directory);
            } catch (err) {
                const error = err as Error;
                if (
                    error && error.message &&
                    error.message.includes('Invalid cross-device link (os error 18): rename')
                ) {
                    // Deno.rename fails to move files between different file system devices
                    // revert to copy+remove
                    await Deno.copyFile(booking.tempFile, targetPath.fullPath);
                    await Deno.remove(booking.tempFile);
                } else {
                    ctx.response.status = HTTP_500_INTERNAL_SERVER_ERROR;
                    return;
                }
            }

            apiTokens.delete(token);
            ctx.response.status = HTTP_200_OK;
        },
    );
}
