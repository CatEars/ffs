import { Router } from '@oak/oak';
import { registerAdminClearCacheRoutes } from './clear-cache.ts';

export function registerAllAdminRoutes(router: Router) {
    registerAdminClearCacheRoutes(router);
}
