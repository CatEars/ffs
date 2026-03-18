import { Middleware } from '@oak/oak';
import { requestLogger } from './logger.ts';

export const logAccessRequests: Middleware = (ctx, next) => {
    const origin = ctx.request.headers.get('X-Forwarded-For') || ctx.request.ip;
    requestLogger.info(origin, '->', ctx.request.url.toString());
    return next();
};
