import { logger } from "../logging/logger.ts";
import { ThumbnailRequest } from "./types.ts";

export async function generateThumbnail(thumbnailRequest: ThumbnailRequest) {
  logger.debug("Generating thumbnail for", thumbnailRequest);
}
