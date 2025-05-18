import { ThumbnailRequest } from "../types.ts";
import { logger } from "../../logging/logger.ts";
import { ensureDir } from "@std/fs/ensure-dir";
import { dirname } from "@std/path/dirname";
import { getThumbnailPath } from "../../files/cache-folder.ts";
import { move } from "@std/fs";

export async function createMp4Thumbnail(thumbnail: ThumbnailRequest) {
  const outputPath = getThumbnailPath(thumbnail.filePath);
  const tempFile = await Deno.makeTempFile({
    prefix: "ffs_mp4gen",
    suffix: ".webp",
  });
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
      "-y",
      tempFile,
    ],
  });
  const result = await command.output();
  if (!result.success) {
    logger.debug("ffmpeg problems", new TextDecoder().decode(result.stderr));
    await Deno.remove(tempFile);
    return;
  }
  await move(tempFile, outputPath, { overwrite: true });
  logger.debug(
    "Generated thumbnail",
    outputPath,
  );
}
