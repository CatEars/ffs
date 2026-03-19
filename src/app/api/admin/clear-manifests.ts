import { Router } from '@oak/oak';
import { clearAndEnsureDirectoryExists } from '../../../lib/file-system/clear-and-ensure-dir.ts';
import { returnToSender } from '../../../lib/http/return-to-sender.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { getManifestsDir } from '../../files/cache-folder.ts';
import { logger } from '../../logging/loggers.ts';
import { ensurePermissions } from '../../security/api-protect.ts';

export function register(router: Router) {
    router.post(
        '/api/admin/clear-manifests',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        ensurePermissions((p) => p.allowHousekeeping),
        async (ctx) => {
            await clearAndEnsureDirectoryExists(getManifestsDir());
            logger.info('Cleared share link manifests directory');
            returnToSender(ctx, {
                search: {
                    'message': 'Share link manifests cleared',
                },
            });
        },
    );
}
