import { Router } from '@oak/oak';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { createNewUser, storeUserAsEphemeralUser } from '../security/users.ts';
import { HTTP_400_BAD_REQUEST, HTTP_403_FORBIDDEN } from '../utils/http-codes.ts';
import { logger } from '../logging/logger.ts';

export function registerAdminCreateUserRoutes(router: Router) {
    router.get(
        '/api/user/capabilities',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        (ctx) => {
            ctx.response.body = {
                canCreateUsers: !!ctx.state.userPermissions?.canCreateUsers,
            };
        },
    );

    router.post(
        '/api/admin/create-user',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        async (ctx) => {
            if (!ctx.state.userPermissions?.canCreateUsers) {
                ctx.response.status = HTTP_403_FORBIDDEN;
                ctx.response.body = { error: 'You do not have permission to create users' };
                return;
            }

            const body = await ctx.request.body.json();
            const { username, password } = body;

            if (!username || !password) {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                ctx.response.body = { error: 'Username and password are required' };
                return;
            }

            try {
                const newUser = createNewUser(username, password);
                await storeUserAsEphemeralUser(newUser);
                logger.info(`Created new user: ${username}`);
                ctx.response.body = { success: true };
            } catch (err) {
                ctx.response.status = HTTP_400_BAD_REQUEST;
                ctx.response.body = { error: (err as Error).message };
            }
        },
    );
}
