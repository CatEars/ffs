import { Middleware } from '@oak/oak';
import { logAccessRequests } from './logging/access-logging.ts';
import { FfsApplicationState, resolveUserConfigToState } from './user-config/index.ts';
import { apiProtect } from './security/api-protect.ts';

export function baseMiddlewares(): Middleware {
    return logAccessRequests;
}

export function protectedMiddlewares(): Middleware<FfsApplicationState>[] {
    return [apiProtect, resolveUserConfigToState];
}
