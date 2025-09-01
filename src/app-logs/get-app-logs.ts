import { Router } from '@oak/oak';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { backgroundProcessLogger, logger, requestLogger } from '../logging/logger.ts';

export function registerGetAppLogEndpoint(router: Router) {
    router.get('/api/logs', baseMiddlewares(), ...protectedMiddlewares(), (ctx) => {
        ctx.response.body = {
            logs: [
                { name: 'System Log', entries: logger.inspectRecentLogs() },
                { name: 'Request Log', entries: requestLogger.inspectRecentLogs() },
                {
                    name: 'Background Task Logs',
                    entries: backgroundProcessLogger.inspectRecentLogs(),
                },
            ],
        };
    });
}
