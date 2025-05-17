import { ThumbnailRequest } from "./types.ts";
import { extname } from "@std/path";
import { existsSync } from "@std/fs/exists";
import { createMp4Thumbnail } from "./processors/mp4.ts";
import { getThumbnailPath } from "../files/cache-folder.ts";

export async function generateThumbnail(thumbnail: ThumbnailRequest) {
  if (extname(thumbnail.filePath) === ".mp4") {
    await createMp4Thumbnail(thumbnail);
  }
}

export function thumbnailExists(filePath: string) {
  return existsSync(getThumbnailPath(filePath));
}
