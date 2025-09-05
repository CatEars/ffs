import { Router } from '@oak/oak';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { logger } from '../logging/logger.ts';
import { returnToSender } from '../utils/return-to-sender.ts';

export function registerFileDeletionRoute(router: Router) {
    router.post('/api/file/remove', baseMiddlewares(), ...protectedMiddlewares(), async (ctx) => {
        const fileTree = ctx.state.fileTree;
        const formData = await ctx.request.body.formData();

        const filesToRemoveRaw = formData.get('files-to-remove');
        if (!filesToRemoveRaw) {
            ctx.response.status = 400;
            ctx.response.body = { error: 'Missing files-to-remove' };
            return;
        }

        let filesToRemove: Array<{ path: string; fileName: string }>;
        try {
            filesToRemove = JSON.parse(filesToRemoveRaw.toString());
            if (!Array.isArray(filesToRemove)) throw new Error();
        } catch {
            ctx.response.status = 400;
            ctx.response.body = { error: 'Invalid files-to-remove format' };
            return;
        }

        for (const { path, fileName } of filesToRemove) {
            const resolvedFrom = fileTree.resolvePath(path, fileName);
            if (resolvedFrom.type === 'invalid') {
                continue;
            }

            try {
                await Deno.remove(resolvedFrom.fullPath, { recursive: true });
                logger.info('Removed file', resolvedFrom.fullPath);
            } catch (err) {
                logger.warn('Failed to remove', resolvedFrom.fullPath, 'but got', err);
            }
        }

        returnToSender(ctx, {
            defaultPath: '/file-namager/',
        });
    });
}
