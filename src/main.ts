import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { registerAllFileListing } from "./file-listing/index.ts";
import { setConfig, unsecure, validateConfig } from "./config.ts";
import { registerAllLogonRoutes } from "./logon/index.ts";
import { registerAllWebsiteRoutes } from "./website/index.ts";
import { logger } from "./logging/logger.ts";
import {
  areThumbnailsAvailable,
  registerAllThumbnailRoutes,
  startThumbnailBackgroundProcess,
} from "./thumbnails/index.ts";
import { resolveCacheFolder } from "./files/cache-folder.ts";

setConfig({
  storeRoot: ".",
  usersFilePath: "data/users-file.json",
  cacheRoot: await resolveCacheFolder(),
});
validateConfig();

if (Deno.env.get("FFS_ABANDON_SECURITY") === "true") {
  unsecure();
}

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

logger.info("Starting server on http://localhost:8080");
app.listen({ port: 8080 });
