import { Router } from '@oak/oak';
import { baseMiddlewares, protectedMiddlewares } from '../../base-middlewares.ts';
import { optionalModules } from '../../optional-modules.ts';
import { ensurePermissions } from '../../security/api-protect.ts';
import { csrfProtect } from '../../security/csrf-protect.ts';

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
            const body = await ctx.request.body.json();
            const mod = optionalModules.find((m) => m.name === body.name);
            if (!mod) {
                ctx.response.status = 404;
                ctx.response.body = { error: 'Module not found' };
                return;
            }
            const isAvailable = await mod.isAvailable();
            if (!isAvailable) {
                ctx.response.status = 400;
                ctx.response.body = { error: 'Module is not available' };
                return;
            }
            await mod.activate();
            ctx.response.body = { name: mod.name, isActivated: mod.isActivated() };
        },
    );

    router.post(
        '/api/admin/modules/deactivate',
        baseMiddlewares(),
        ...protectedMiddlewares(),
        csrfProtect,
        ensurePermissions((p) => p.allowHousekeeping),
        async (ctx) => {
            const body = await ctx.request.body.json();
            const mod = optionalModules.find((m) => m.name === body.name);
            if (!mod) {
                ctx.response.status = 404;
                ctx.response.body = { error: 'Module not found' };
                return;
            }
            await mod.deactivate();
            ctx.response.body = { name: mod.name, isActivated: mod.isActivated() };
        },
    );
}
