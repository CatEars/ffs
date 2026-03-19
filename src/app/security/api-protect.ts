import { Context } from '@oak/oak/context';
import { Middleware, Next } from '@oak/oak/middleware';
import { HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN } from '../../lib/http/http-codes.ts';
import { FfsApplicationState, UserPermissions } from '../application-state.ts';
import { shouldAbandonSecurity } from '../config.ts';
import { getUserMatchingApiKey, UserAuth } from './users.ts';

type UserAuthenticationHook = (ctx: Context<FfsApplicationState>, user: UserAuth) => Promise<void>;

let onUserAuthenticateHook: UserAuthenticationHook = () => Promise.resolve();

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
        await onUserAuthenticateHook(ctx, user);
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

export type PermissionSelector = (
    permissions: UserPermissions,
) => (boolean | undefined)[] | (boolean | undefined);

export type PermissionEnsuringOptions = {
    message: string;
};

export const ensurePermissions: (
    selector: PermissionSelector,
    options?: Partial<PermissionEnsuringOptions>,
) => Middleware<FfsApplicationState> =
    (selector: PermissionSelector, options?: Partial<PermissionEnsuringOptions>) =>
    async (ctx, next) => {
        const opts = options ?? {};
        const selection = selector(ctx.state.userPermissions || {});
        const selectedPermissions = Array.isArray(selection) ? selection : [selection];
        if (selectedPermissions.every((x) => x === true)) {
            ctx.response.status = HTTP_403_FORBIDDEN;
            ctx.response.body = { error: opts.message ?? 'Forbidden' };
            return;
        }
        await next();
    };
