import { stdin } from "node:process";
import { getCacheRoot } from "../config.ts";
import { logger } from "../logging/logger.ts";
import { ThumbnailRequest } from "./types.ts";
import { generateThumbnail } from "./generate-thumbnail.ts";
import { sleep } from "../utils/sleep.ts";
import { Buffer } from "node:buffer";

const cacheRoot = getCacheRoot();
logger.info(
  "Background task for thumbnail generation started. Storing thumbnails in cache at",
  cacheRoot,
);

const filesToPrioritize: ThumbnailRequest[] = [];

function parseIncomingThumbnailRequest(data: Buffer<ArrayBufferLike>) {
  const request = new TextDecoder().decode(data);
  try {
    const res = JSON.parse(request) as ThumbnailRequest;
    if (!res.filePath) {
      return;
    }
    filesToPrioritize.push(res);
  } catch (err) {
    logger.warn(
      "Received thumbnail prio request, but unable to parse it. Error:",
      err,
    );
  }
}

stdin.addListener("data", parseIncomingThumbnailRequest);

while (true) {
  while (filesToPrioritize.length > 0) {
    const next = filesToPrioritize.splice(0, 1)[0];
    await generateThumbnail(next);
  }
  await sleep(500);
}
