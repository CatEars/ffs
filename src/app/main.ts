import { Application } from '@oak/oak/application';
import { Router } from '@oak/oak/router';
import { dirname } from '@std/path/dirname';
import { fromFileUrl } from '@std/path/from-file-url';
import { join } from 'node:path';
import { findRouteRegistrationsInFileTree } from '../lib/file-router/register-routes-by-file-tree.ts';
import {
    FfsApplicationState,
    setPermissionsFromUserOrDefaultToRootAccess,
} from './application-state.ts';
import { unsecure, validateConfig } from './config.ts';
import { thumbnailProviderChain } from './api/thumbnail/index.ts';
import { resolveUserFileTreeFromState } from './files/resolve-file-tree.ts';
import './includes-for-compilation.ts';
import { initializeLoggers, logger } from './logging/loggers.ts';
import { setOnUserAuthenticationHook } from './security/api-protect.ts';
import { likelyFirstTimeUser, printWelcomeHelper, startup } from './startup.ts';
import * as thumbnailModule from './thumbnails/module.ts';
import { registerAllWebsiteRoutes } from './website/index.ts';

if (Deno.env.get('FFS_ABANDON_SECURITY') === 'true') {
    unsecure();
}

await startup();
validateConfig();

await initializeLoggers();

const app = new Application<FfsApplicationState>();
const router = new Router();

setOnUserAuthenticationHook(async (ctx, user) => {
    setPermissionsFromUserOrDefaultToRootAccess(ctx, user.permissions);
    await resolveUserFileTreeFromState(ctx);
});

const routeRegistrations = await findRouteRegistrationsInFileTree(
    join(dirname(fromFileUrl(import.meta.url)), 'api'),
    logger,
);
for (const routeRegistrator of routeRegistrations) {
    await routeRegistrator(router);
}
await registerAllWebsiteRoutes(router);

if (thumbnailModule.isAvailable()) {
    thumbnailModule.activate(thumbnailProviderChain);
    await thumbnailModule.startBackgroundTasks();
} else {
    logger.warn(
        'ffmpeg is not available, so will not generate thumbnails in the background',
    );
}

app.use(router.routes());
app.use(router.allowedMethods());

if (likelyFirstTimeUser) {
    printWelcomeHelper();
}

const port = 8080;
logger.info(`Starting server on port ${port}`);
app.listen({ port });
