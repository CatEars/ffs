import { stdin } from "node:process";
import { devModeEnabled, getCacheRoot, getStoreRoot } from "../config.ts";
import { logger } from "../logging/logger.ts";
import { ThumbnailRequest } from "./types.ts";
import {
  canGenerateThumbnailFor,
  generateThumbnail,
} from "./generate-thumbnail.ts";
import { sleep } from "../utils/sleep.ts";
import { Buffer } from "node:buffer";
import { walk, WalkEntry } from "@std/fs";
import { MemoryCache } from "../utils/memory-cache.ts";
import { thumbnailExists } from "../files/cache-folder.ts";

const cacheRoot = getCacheRoot();
const storeRoot = getStoreRoot();
logger.info(
  "Background task for thumbnail generation started. Storing thumbnails in cache at",
  cacheRoot,
);

const filesToPrioritize: ThumbnailRequest[] = [];
const fiveMinutes = 1000 * 60 * 60 * 5;
const recentlyParsedThumbnails = new MemoryCache<ThumbnailRequest>(fiveMinutes);

function parseIncomingThumbnailRequest(data: Buffer<ArrayBufferLike>) {
  const request = new TextDecoder().decode(data);
  const lines = request.split("\n");
  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    try {
      const res = JSON.parse(line) as ThumbnailRequest;
      if (!res.filePath || !res.filePath.trim()) {
        continue;
      }

      // Always push STDIN requests to top. Let those found on own be at end
      filesToPrioritize.splice(0, 0, res);
    } catch (err) {
      logger.warn(
        "Received thumbnail prio request, but unable to parse it. Error:",
        err,
      );
    }
  }
}

stdin.addListener("data", parseIncomingThumbnailRequest);

function tryPushToQueue(file: WalkEntry) {
  if (!thumbnailExists(file.path)) {
    filesToPrioritize.push({
      filePath: file.path,
    });
  }
}

async function findFilesToThumbnail() {
  for await (const file of walk(storeRoot)) {
    if (canGenerateThumbnailFor(file.path)) {
      tryPushToQueue(file);
    }
  }
}

await findFilesToThumbnail();
setInterval(findFilesToThumbnail, devModeEnabled ? 10_000 : 60_000);

while (true) {
  while (filesToPrioritize.length > 0) {
    const next = filesToPrioritize.splice(0, 1)[0];
    if (
      recentlyParsedThumbnails.get(next.filePath) ||
      thumbnailExists(next.filePath)
    ) {
      continue;
    }
    await generateThumbnail(next);
    recentlyParsedThumbnails.set(next.filePath, next);
  }
  await sleep(500);
}
