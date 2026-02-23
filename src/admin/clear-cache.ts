import { Router } from '@oak/oak';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { getManifestsDir, getThumbnailsDir } from '../files/cache-folder.ts';
import { logger } from '../logging/logger.ts';
import { clearAndEnsureDirectoryExists } from '../utils/clear-and-ensure-dir.ts';

export function registerAdminClearCacheRoutes(router: Router) {
    router.post(
        '/api/admin/clear-manifests',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        async (ctx) => {
            await clearAndEnsureDirectoryExists(getManifestsDir());
            logger.info('Cleared share link manifests directory');
            ctx.response.body = { success: true };
        },
    );

    router.post(
        '/api/admin/clear-thumbnails',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        async (ctx) => {
            await clearAndEnsureDirectoryExists(getThumbnailsDir());
            logger.info('Cleared thumbnails directory');
            ctx.response.body = { success: true };
        },
    );
}
