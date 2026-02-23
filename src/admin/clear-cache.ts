import { Router } from '@oak/oak';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { getManifestsDir, getThumbnailsDir } from '../files/cache-folder.ts';
import { logger } from '../logging/logger.ts';

async function clearDirectory(dirPath: string) {
    try {
        await Deno.remove(dirPath, { recursive: true });
    } catch (err) {
        if (!(err instanceof Deno.errors.NotFound)) {
            throw err;
        }
    }
    await Deno.mkdir(dirPath, { recursive: true });
}

export function registerAdminClearCacheRoutes(router: Router) {
    router.post(
        '/api/admin/clear-manifests',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        async (ctx) => {
            const dir = getManifestsDir();
            await clearDirectory(dir);
            logger.info('Cleared share link manifests directory');
            ctx.response.body = { success: true };
        },
    );

    router.post(
        '/api/admin/clear-thumbnails',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        async (ctx) => {
            const dir = getThumbnailsDir();
            await clearDirectory(dir);
            logger.info('Cleared thumbnails directory');
            ctx.response.body = { success: true };
        },
    );
}
