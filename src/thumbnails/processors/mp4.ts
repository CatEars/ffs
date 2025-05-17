import { ThumbnailRequest } from "../types.ts";
import { logger } from "../../logging/logger.ts";
import { ensureDir } from "@std/fs/ensure-dir";
import { dirname } from "@std/path/dirname";
import { getThumbnailPath } from "../../files/cache-folder.ts";

export async function createMp4Thumbnail(thumbnail: ThumbnailRequest) {
  const outputPath = getThumbnailPath(thumbnail.filePath);
  ensureDir(dirname(outputPath));
  const command = new Deno.Command("ffmpeg", {
    args: [
      "-i",
      thumbnail.filePath,
      "-ss",
      "00:00:30",
      "-vframes",
      "1",
      "-vf",
      "scale=320:-1",
      outputPath,
    ],
  });
  await command.output();
  logger.debug(
    "Generated thumbnail",
    outputPath,
  );
}
