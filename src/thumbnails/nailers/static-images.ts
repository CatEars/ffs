import { ensureDir } from "@std/fs/ensure-dir";
import { getCacheRoot } from "../../config.ts";
import { ThumbnailRequest } from "../types.ts";
import { dirname } from "@std/path/dirname";
import { getThumbnailPath } from "../../files/cache-folder.ts";
import { logger } from "../../logging/logger.ts";
import { move } from "@std/fs/move";

export async function createImageMagickThumbnail(thumbnail: ThumbnailRequest) {
  const outputPath = getThumbnailPath(thumbnail.filePath);
  const tempFile = await Deno.makeTempFile({
    prefix: "ffs_imggen",
    dir: getCacheRoot(),
    suffix: ".webp",
  });
  ensureDir(dirname(outputPath));
  const command = new Deno.Command("convert", {
    args: [
      thumbnail.filePath,
      "-thumbnail",
      "128x128",
      "-quality",
      "60",
      tempFile,
    ],
  });
  const result = await command.output();
  if (!result.success) {
    logger.debug(
      "image magick problems",
      new TextDecoder().decode(result.stderr),
    );
    await Deno.remove(tempFile);
    return;
  }
  await move(tempFile, outputPath, { overwrite: true });
  logger.debug(
    "Generated thumbnail",
    outputPath,
  );
}
