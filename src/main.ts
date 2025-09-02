import { Application } from 'jsr:@oak/oak/application';
import { Router } from 'jsr:@oak/oak/router';
import { registerAllFileListing } from './file-listing/index.ts';
import { unsecure, validateConfig } from './config.ts';
import { registerAllLogonRoutes } from './logon/index.ts';
import { registerAllWebsiteRoutes } from './website/index.ts';
import { initializeLoggers, logger } from './logging/logger.ts';
import {
    areThumbnailsAvailable,
    registerAllThumbnailRoutes,
    startThumbnailBackgroundProcess,
} from './thumbnails/index.ts';
import { likelyFirstTimeUser, printWelcomeHelper, startup } from './startup.ts';
import { registerSitemapRoute } from './sitemap/index.ts';
import { registerAllCustomCommandApi } from './custom-commands/index.ts';
import { registerAllFileShareRoutes } from './share-file/index.ts';
import {
    FfsApplicationState,
    setAccessFromUserConfigOrDefaultToRootAccess,
} from './application-state.ts';
import { resolveUserFileTreeFromState } from './file-listing/resolve-file-tree.ts';
import { setOnUserAuthenticationHook } from './security/api-protect.ts';
import { registerAllAppLogsEndpoints } from './app-logs/index.ts';

if (Deno.env.get('FFS_ABANDON_SECURITY') === 'true') {
    unsecure();
}

await startup();
validateConfig();

await initializeLoggers();

const app = new Application<FfsApplicationState>();
const router = new Router();

setOnUserAuthenticationHook((ctx, user) => {
    setAccessFromUserConfigOrDefaultToRootAccess(ctx, user.config);
    resolveUserFileTreeFromState(ctx);
});

registerAllFileListing(router);
registerAllFileShareRoutes(router);
registerAllLogonRoutes(router);
await registerAllWebsiteRoutes(router);
registerAllThumbnailRoutes(router);
registerSitemapRoute(router);
registerAllCustomCommandApi(router);
registerAllAppLogsEndpoints(router);

if (areThumbnailsAvailable()) {
    startThumbnailBackgroundProcess();
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
