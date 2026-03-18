import { Router } from '@oak/oak';
import { registerAdminClearCacheRoutes } from './clear-cache.ts';
import { registerAdminCreateUserRoutes } from './create-user.ts';

export function registerAllAdminRoutes(router: Router) {
    registerAdminClearCacheRoutes(router);
    registerAdminCreateUserRoutes(router);
}
