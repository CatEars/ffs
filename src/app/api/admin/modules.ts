import { Router } from '@oak/oak';
import { returnToSender } from '../../../lib/http/return-to-sender.ts';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { optionalModules } from '../../optional-modules.ts';
import { ensurePermissions } from '../../security/api-protect.ts';
import { csrfProtect } from '../../security/csrf-protect.ts';

const ADMIN_PAGE = '/admin/';

export function register(router: Router) {
    router.get(
        '/api/admin/modules',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        ensurePermissions((p) => p.allowHousekeeping),
        async (ctx) => {
            const modules = await Promise.all(
                optionalModules.map(async (mod) => ({
                    name: mod.name,
                    description: mod.description,
                    isActivated: mod.isActivated(),
                    isAvailable: await mod.isAvailable(),
                })),
            );
            ctx.response.body = modules;
        },
    );

    router.post(
        '/api/admin/modules/activate',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        csrfProtect,
        ensurePermissions((p) => p.allowHousekeeping),
        async (ctx) => {
            const formData = await ctx.request.body.formData();
            const name = formData.get('name')?.toString() ?? '';
            if (!name) {
                returnToSender(ctx, {
                    search: { message: 'Error: module name is required' },
                    defaultPath: ADMIN_PAGE,
                });
                return;
            }
            const mod = optionalModules.find((m) => m.name === name);
            if (!mod) {
                returnToSender(ctx, {
                    search: { message: `Error: module '${name}' not found` },
                    defaultPath: ADMIN_PAGE,
                });
                return;
            }
            const isAvailable = await mod.isAvailable();
            if (!isAvailable) {
                returnToSender(ctx, {
                    search: { message: `Error: module '${name}' is not available` },
                    defaultPath: ADMIN_PAGE,
                });
                return;
            }
            await mod.activate();
            returnToSender(ctx, {
                search: { message: `Module '${name}' activated` },
                defaultPath: ADMIN_PAGE,
            });
        },
    );

    router.post(
        '/api/admin/modules/deactivate',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        csrfProtect,
        ensurePermissions((p) => p.allowHousekeeping),
        async (ctx) => {
            const formData = await ctx.request.body.formData();
            const name = formData.get('name')?.toString() ?? '';
            if (!name) {
                returnToSender(ctx, {
                    search: { message: 'Error: module name is required' },
                    defaultPath: ADMIN_PAGE,
                });
                return;
            }
            const mod = optionalModules.find((m) => m.name === name);
            if (!mod) {
                returnToSender(ctx, {
                    search: { message: `Error: module '${name}' not found` },
                    defaultPath: ADMIN_PAGE,
                });
                return;
            }
            await mod.deactivate();
            returnToSender(ctx, {
                search: { message: `Module '${name}' deactivated` },
                defaultPath: ADMIN_PAGE,
            });
        },
    );
}
