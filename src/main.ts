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
import { startup } from './startup.ts';
import { registerSitemapRoute } from './sitemap/index.ts';
import { registerAllCustomCommandApi } from './custom-commands/index.ts';
import { resetSecuritySaltEveryTwentyFiveHours } from './security/users.ts';
import { registerAllFileShareRoutes } from './share-file/index.ts';
import { FfsApplicationState, registerUserConfigStateSetter } from './user-config/index.ts';
import { getRootFileTree, resolveUserFileTreeIntoState } from './file-listing/resolve-file-tree.ts';

if (Deno.env.get('FFS_ABANDON_SECURITY') === 'true') {
    unsecure();
}

await startup();
validateConfig();

await initializeLoggers();

const app = new Application<FfsApplicationState>();
const router = new Router();

registerUserConfigStateSetter((ctx) => {
    // Set default file tree to store root, later invocation may update it
    ctx.state.fileTree = getRootFileTree();
});
registerUserConfigStateSetter(resolveUserFileTreeIntoState);

resetSecuritySaltEveryTwentyFiveHours();
registerAllFileListing(router);
registerAllFileShareRoutes(router);
registerAllLogonRoutes(router);
await registerAllWebsiteRoutes(router);
registerAllThumbnailRoutes(router);
registerSitemapRoute(router);
registerAllCustomCommandApi(router);

if (areThumbnailsAvailable()) {
    startThumbnailBackgroundProcess();
} else {
    logger.warn(
        'ffmpeg is not available, so will not generate thumbnails in the background',
    );
}

app.use(router.routes());
app.use(router.allowedMethods());

const port = 8080;
logger.info(`Starting server on port ${port}`);
app.listen({ port });
