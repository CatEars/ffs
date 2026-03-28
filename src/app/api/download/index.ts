import { Router } from '@oak/oak';
import { HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND } from '../../../lib/http/http-codes.ts';
import { resolveUnder } from '../../../lib/resolve-under/resolve-under.ts';
import { sendFilesSmartly } from '../../../lib/send-smartly/send-smartly.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { getStoreRoot } from '../../config.ts';
import { logger } from '../../logging/loggers.ts';

export function register(router: Router) {
    router.post('/api/download', baseMiddlewares(), ...protectedMiddlewares(), async (ctx) => {
        const formData = await ctx.request.body.formData();
        const filePaths = formData.getAll('file');
        const root = formData.get('root')?.toString();
        if (!root || !filePaths) {
            ctx.response.status = HTTP_400_BAD_REQUEST;
            return;
        }

        const resolvedRoot = resolveUnder(root, getStoreRoot());
        if (resolvedRoot === null) {
            ctx.response.status = HTTP_404_NOT_FOUND;
            return;
        }

        await sendFilesSmartly(ctx, filePaths.map((x) => x.toString() || ''), {
            root: resolvedRoot,
            logger: logger,
        });
    });
}
