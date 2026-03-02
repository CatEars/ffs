import { Router } from '@oak/oak';
import { baseMiddlewares, protectedMiddlewares } from '../base-middlewares.ts';
import { createNewUser, storeUserAsEphemeralUser } from '../security/users.ts';
import { HTTP_403_FORBIDDEN } from '../utils/http-codes.ts';
import { logger } from '../logging/logger.ts';
import { returnToSender } from '../utils/return-to-sender.ts';

const ADMIN_PAGE = '/admin/';

export function registerAdminCreateUserRoutes(router: Router) {
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

            const formData = await ctx.request.body.formData();
            const username = formData.get('username')?.toString() ?? '';
            const password = formData.get('password')?.toString() ?? '';

            if (!username || !password) {
                returnToSender(ctx, {
                    search: { error: 'Username and password are required' },
                    defaultPath: ADMIN_PAGE,
                });
                return;
            }

            try {
                const newUser = createNewUser(username, password);
                await storeUserAsEphemeralUser(newUser);
                logger.info(`Created new user: ${username}`);
                returnToSender(ctx, {
                    search: { success: `User '${username}' created successfully` },
                    defaultPath: ADMIN_PAGE,
                });
            } catch (err) {
                returnToSender(ctx, {
                    search: { error: (err as Error).message },
                    defaultPath: ADMIN_PAGE,
                });
            }
        },
    );
}
