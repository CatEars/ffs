import { Router } from '@oak/oak';
import { resolve } from '@std/path/resolve';
import { availableDiskBytes } from '../../../lib/file-system/disk-space.ts';
import { formatBytes } from '../../../lib/file-system/format-bytes.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { getStoreRoot } from '../../config.ts';

export function register(router: Router) {
    router.get(
        '/api/admin/disk-usage',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        async (ctx) => {
            const root = resolve(getStoreRoot());
            const diskUsage = await availableDiskBytes(root);
            const formatted = formatBytes(diskUsage);
            ctx.response.body = {
                path: root,
                available: formatted,
            };
        },
    );
}
