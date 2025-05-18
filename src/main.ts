import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { registerAllFileListing } from "./file-listing/index.ts";
import { unsecure, validateConfig } from "./config.ts";
import { registerAllLogonRoutes } from "./logon/index.ts";
import { registerAllWebsiteRoutes } from "./website/index.ts";
import { logger } from "./logging/logger.ts";
import {
  areThumbnailsAvailable,
  registerAllThumbnailRoutes,
  startThumbnailBackgroundProcess,
} from "./thumbnails/index.ts";
import { startup } from "./startup.ts";

if (Deno.env.get("FFS_ABANDON_SECURITY") === "true") {
  unsecure();
}

await startup();
validateConfig();

const app = new Application();
const router = new Router();

registerAllFileListing(router);
registerAllLogonRoutes(router);
await registerAllWebsiteRoutes(router);
registerAllThumbnailRoutes(router);

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
