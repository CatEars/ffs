import { Middleware, Next } from '@oak/oak/middleware';
import { Context } from '@oak/oak/context';
import { shouldAbandonSecurity } from '../config.ts';
import { HTTP_401_UNAUTHORIZED } from '../utils/http-codes.ts';
import { getUserMatchingApiKey, UserAuth } from './users.ts';
import { FfsApplicationState } from '../application-state.ts';

type UserAuthenticationHook = (ctx: Context<FfsApplicationState>, user: UserAuth) => void;

let onUserAuthenticateHook: UserAuthenticationHook = () => {};

export function setOnUserAuthenticationHook(func: UserAuthenticationHook) {
    onUserAuthenticateHook = func;
}

const resolveUserAndRespond = async (
    apiKey: string,
    ctx: Context<FfsApplicationState>,
    next: Next,
) => {
    const user = await getUserMatchingApiKey(apiKey);
    if (user) {
        onUserAuthenticateHook(ctx, user);
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
        return await resolveUserAndRespond(apiKey, ctx, next);
    }

    const authHeader = ctx.request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('FFS ')) {
        const apiKey = authHeader.substring('FFS '.length);
        return await resolveUserAndRespond(apiKey, ctx, next);
    }

    ctx.response.status = HTTP_401_UNAUTHORIZED;
};
