import { Router } from '@oak/oak';
import { FfsApplicationState } from '../application-state.ts';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import {
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
} from '../utils/http-codes.ts';
import { returnToSender } from '../utils/return-to-sender.ts';

export function registerMakeDirectoryRoute(router: Router<FfsApplicationState>) {
    router.post(
        '/api/directory/make',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        async (ctx) => {
            const fileTree = ctx.state.fileTree;
            const formData = await ctx.request.body.formData();
            const path = formData.get('path')?.toString() || '.';
            const directoryName = formData.get('name')?.toString() || '';
            if (!directoryName || !path) {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                ctx.response.body = {
                    error: 'You have to supply a valid path and directory name to create',
                };
                return;
            }

            const rootPath = fileTree.listDirectory(path);
            const resolved = fileTree.resolvePath(path, directoryName);
            if (rootPath.type === 'none' || resolved.type === 'invalid') {
                ctx.response.status = HTTP_404_NOT_FOUND;
                ctx.response.body = { error: 'Could not find path to create directory in' };
                return;
            }

            if (resolved.exists) {
                ctx.response.status = HTTP_403_FORBIDDEN;
                ctx.response.body = { error: 'Cannot create a directory that already exists' };
                return;
            }

            await Deno.mkdir(resolved.fullPath);
            returnToSender(ctx, {
                defaultPath: '/home/',
            });
        },
    );
}
