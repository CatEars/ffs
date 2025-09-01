import { Router } from '@oak/oak';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { logger } from '../logging/logger.ts';

export function registerGetAppLogEndpoint(router: Router) {
    router.get('/api/logs', baseMiddlewares(), ...protectedMiddlewares(), (ctx) => {
        ctx.response.body = {
            logs: [
                { name: 'System Log', entries: logger.inspectRecentLogs() },
            ],
        };
    });
}
