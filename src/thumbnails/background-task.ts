import { stdin } from "node:process";
import { getCacheRoot } from "../config.ts";
import { logger } from "../logging/logger.ts";
import { ThumbnailPrio } from "./type.ts";

logger.info("Background thread for thumbnail generation started");
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const cacheRoot = getCacheRoot();
logger.info("Storing thumbnails in cache at", cacheRoot);

const filesToPrioritize: ThumbnailPrio[] = [];

while (true) {
  stdin.addListener("data", (data) => {
    const request = new TextDecoder().decode(data);
    try {
      const res = JSON.parse(request) as ThumbnailPrio;
      if (!res.filePath) {
        return;
      }
      filesToPrioritize.push(res);
      logger.debug(
        "Added",
        res.filePath,
        "to thumbnail queue, now at",
        filesToPrioritize.length,
        "queued requests",
      );
    } catch (err) {
      logger.warn(
        "Received thumbnail prio request, but unable to parse it. Error:",
        err,
      );
    }
  });
  await sleep(10000);
}
