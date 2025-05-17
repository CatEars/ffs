import { Router } from "@oak/oak";
import { baseMiddlewares } from "../base-middlewares.ts";
import { apiProtect } from "../security/api-protect.ts";
import { getCacheRoot } from "../config.ts";
import {
  canGenerateThumbnailFor,
  thumbnailExists,
} from "./generate-thumbnail.ts";
import { prioritizeThumbnail } from "./index.ts";
import { exists } from "@std/fs/exists";
import { getThumbnailPath } from "../files/cache-folder.ts";
import { sleep } from "../utils/sleep.ts";
import {
  HTTP_400_BAD_REQUEST,
  HTTP_404_NOT_FOUND,
} from "../utils/http-codes.ts";
import { logger } from "../logging/logger.ts";

async function tryGetFile(thumbnailPath: string) {
  for (let cnt = 0; cnt < 20; ++cnt) {
    if (await exists(thumbnailPath)) {
      return true;
    }
    await sleep(200);
  }
  return false;
}

async function waitUntilFilepathExistsOrBail(filePath: string) {
  const thumbnailPath = getThumbnailPath(filePath);
  const race = Promise.race([tryGetFile(thumbnailPath), sleep(5050)]);
  try {
    const res = await race;
    return !!res;
  } catch {
    return false;
  }
}

export function registerGetThumbnail(router: Router) {
  router.get("/api/thumbnail", baseMiddlewares(), apiProtect, async (ctx) => {
    const path = ctx.request.url.searchParams.get("path");
    if (!path || !canGenerateThumbnailFor(path)) {
      ctx.response.status = HTTP_400_BAD_REQUEST;
      return;
    }

    if (!thumbnailExists(path)) {
      await prioritizeThumbnail(path);
      logger.info("waiting...");
      const generatedThumbnail = await waitUntilFilepathExistsOrBail(path);
      logger.info("finished!...", generatedThumbnail);
      if (!generatedThumbnail) {
        ctx.response.status = HTTP_404_NOT_FOUND;
        return;
      }
    }

    await ctx.send({
      path: path + ".webp",
      root: getCacheRoot(),
    });
  });
}
