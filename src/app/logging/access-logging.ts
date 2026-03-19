import { Middleware } from '@oak/oak';
import { requestLogger } from './loggers.ts';

export const logAccessRequests: Middleware = (ctx, next) => {
    const origin = ctx.request.headers.get('X-Forwarded-For') || ctx.request.ip;
    const url = ctx.request.url;
    // URLs may contain secret information in search params. Focus on path only
    const nonSecretUrl = `${url.protocol}://${url.hostname}${url.pathname}`;
    requestLogger.info(origin, '->', nonSecretUrl);
    return next();
};
