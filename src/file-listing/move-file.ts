import { Router } from '@oak/oak';
import { move } from '@std/fs';
import { logger } from '../logging/logger.ts';
import { baseMiddlewares } from '../base-middlewares.ts';
import { apiProtect } from '../security/api-protect.ts';
import { getRootFileTree } from './resolve-file-tree.ts';

export function registerMoveFileRoute(router: Router) {
    const fileTree = getRootFileTree();

    router.post('/api/file/move', baseMiddlewares(), apiProtect, async (ctx) => {
        const formData = await ctx.request.body.formData();

        const filesToMoveRaw = formData.get('files-to-move');
        const destination = formData.get('destination');

        if (!filesToMoveRaw || !destination) {
            ctx.response.status = 400;
            ctx.response.body = { error: 'Missing files-to-move or destination' };
            return;
        }

        let filesToMove: Array<{ path: string; fileName: string }>;
        try {
            filesToMove = JSON.parse(filesToMoveRaw.toString());
            if (!Array.isArray(filesToMove)) throw new Error();
        } catch {
            ctx.response.status = 400;
            ctx.response.body = { error: 'Invalid files-to-move format' };
            return;
        }

        for (const { path, fileName } of filesToMove) {
            const resolvedFrom = fileTree.resolvePath(path, fileName);
            if (resolvedFrom.type === 'invalid') {
                continue;
            }
            const resolvedTo = fileTree.resolvePath(destination.toString(), fileName);
            if (resolvedTo.type === 'invalid') {
                continue;
            }

            try {
                await move(resolvedFrom.fullPath, resolvedTo.fullPath, {
                    overwrite: false,
                });
            } catch (err) {
                logger.warn(
                    'Tried to move file',
                    path,
                    fileName,
                    'to',
                    destination.toString(),
                    'but failed with',
                    err,
                );
            }
        }

        ctx.response.redirect(
            ctx.request.headers.get('Referer') || '/file-manager/',
        );
    });
}
