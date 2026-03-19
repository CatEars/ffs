import { Router } from '@oak/oak';
import { clearAndEnsureDirectoryExists } from '../../../lib/file-system/clear-and-ensure-dir.ts';
import { returnToSender } from '../../../lib/http/return-to-sender.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { getThumbnailsDir } from '../../files/cache-folder.ts';
import { logger } from '../../logging/loggers.ts';
import { housekeepingMiddleware } from './housekeeping-middleware.ts';

export function register(router: Router) {
    router.post(
        '/api/admin/clear-thumbnails',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        housekeepingMiddleware,
        async (ctx) => {
            await clearAndEnsureDirectoryExists(getThumbnailsDir());
            logger.info('Cleared thumbnails directory');
            returnToSender(ctx, {
                search: {
                    'message': 'Thumbnails cleared',
                },
            });
        },
    );
}
