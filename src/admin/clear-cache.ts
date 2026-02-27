import { Router } from '@oak/oak';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { getManifestsDir, getThumbnailsDir } from '../files/cache-folder.ts';
import { logger } from '../logging/logger.ts';
import { clearAndEnsureDirectoryExists } from '../utils/clear-and-ensure-dir.ts';
import { HTTP_403_FORBIDDEN } from '../utils/http-codes.ts';

export function registerAdminClearCacheRoutes(router: Router) {
    router.post(
        '/api/admin/clear-manifests',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        async (ctx) => {
            if (!ctx.state.userPermissions?.allowHousekeeping) {
                ctx.response.status = HTTP_403_FORBIDDEN;
                ctx.response.body = { error: 'Housekeeping is not allowed for this user' };
                return;
            }
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
            if (!ctx.state.userPermissions?.allowHousekeeping) {
                ctx.response.status = HTTP_403_FORBIDDEN;
                ctx.response.body = { error: 'Housekeeping is not allowed for this user' };
                return;
            }
            await clearAndEnsureDirectoryExists(getThumbnailsDir());
            logger.info('Cleared thumbnails directory');
            ctx.response.body = { success: true };
        },
    );
}
