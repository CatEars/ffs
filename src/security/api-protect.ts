import { Middleware, Next } from '@oak/oak/middleware';
import { Context } from '@oak/oak/context';
import { shouldAbandonSecurity } from '../config.ts';
import { HTTP_401_UNAUTHORIZED } from '../utils/http-codes.ts';
import { getUserMatchingApiKey } from './users.ts';
import { FfsApplicationState } from '../user-config/index.ts';

const resolveUserAndRespond = (apiKey: string, ctx: Context<FfsApplicationState>, next: Next) => {
    const user = getUserMatchingApiKey(apiKey);
    if (user) {
        ctx.state.userConfig = user.config;
        return next();
    } else {
        ctx.response.redirect('/');
        return;
    }
};

export const apiProtect: Middleware<FfsApplicationState> = async (ctx, next) => {
    if (shouldAbandonSecurity()) {
        return next();
    }

    const authCookie = await ctx.cookies.get('FFS-Authorization');
    if (authCookie) {
        const apiKey = authCookie;
        return resolveUserAndRespond(apiKey, ctx, next);
    }

    const authHeader = ctx.request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('FFS ')) {
        const apiKey = authHeader.substring('FFS '.length);
        return resolveUserAndRespond(apiKey, ctx, next);
    }

    ctx.response.status = HTTP_401_UNAUTHORIZED;
};
