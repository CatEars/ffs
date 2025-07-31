import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { registerAllFileListing } from "./file-listing/index.ts";
import { unsecure, validateConfig } from "./config.ts";
import { registerAllLogonRoutes } from "./logon/index.ts";
import { registerAllWebsiteRoutes } from "./website/index.ts";
import { initializeLoggers, logger } from "./logging/logger.ts";
import {
  areThumbnailsAvailable,
  registerAllThumbnailRoutes,
  startThumbnailBackgroundProcess,
} from "./thumbnails/index.ts";
import { startup } from "./startup.ts";
import { registerSitemapRoute } from "./sitemap/index.ts";
import { registerAllCustomCommandApi } from "./custom-commands/index.ts";
import { generatePreloadHtmlTemplate } from "./website/static-files.ts";
import { resetSecuritySaltEveryTwentyFiveHours } from "./security/users.ts";

if (Deno.env.get("FFS_ABANDON_SECURITY") === "true") {
  unsecure();
}

await startup();
validateConfig();

await initializeLoggers();

const app = new Application();
const router = new Router();

resetSecuritySaltEveryTwentyFiveHours();
registerAllFileListing(router);
registerAllLogonRoutes(router);
await registerAllWebsiteRoutes(router);
registerAllThumbnailRoutes(router);
registerSitemapRoute(router);
registerAllCustomCommandApi(router);
generatePreloadHtmlTemplate();

if (areThumbnailsAvailable()) {
  startThumbnailBackgroundProcess();
} else {
  logger.warn(
    "ffmpeg is not available, so will not generate thumbnails in the background",
  );
}

app.use(router.routes());
app.use(router.allowedMethods());

const port = 8080;
logger.info(`Starting server on port ${port}`);
app.listen({ port });
