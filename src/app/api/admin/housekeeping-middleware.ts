import { Middleware } from '@oak/oak/middleware';
import { HTTP_403_FORBIDDEN } from '../../../lib/http/http-codes.ts';
import { FfsApplicationState } from '../../application-state.ts';

export const housekeepingMiddleware: Middleware<FfsApplicationState> = async (ctx, next) => {
    if (!ctx.state.userPermissions?.allowHousekeeping) {
        ctx.response.status = HTTP_403_FORBIDDEN;
        ctx.response.body = { error: 'Housekeeping is not allowed for this user' };
        return;
    }
    await next();
};
