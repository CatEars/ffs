import { Router } from '@oak/oak/router';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';

export function register(router: Router) {
    router.get(
        '/api/user/capabilities',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        (ctx) => {
            ctx.response.body = {
                canCreateUsers: !!ctx.state.userPermissions?.canCreateUsers,
                allowHousekeeping: !!ctx.state.userPermissions?.allowHousekeeping,
            };
        },
    );
}
