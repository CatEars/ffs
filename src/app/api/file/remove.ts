import { Router } from '@oak/oak';
import { returnToSender } from '../../../lib/http/return-to-sender.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { logger } from '../../logging/loggers.ts';
import { csrfProtect } from '../../security/csrf-protect.ts';

export function register(router: Router) {
    router.post(
        '/api/file/remove',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        csrfProtect,
        async (ctx) => {
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
                const resolvedFrom = await fileTree.resolvePath(path, fileName);
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
        },
    );
}
