import { ThumbnailRequest } from "../types.ts";
import { logger } from "../../logging/logger.ts";
import { ensureDir } from "@std/fs/ensure-dir";
import { dirname } from "@std/path/dirname";
import { getThumbnailPath } from "../../files/cache-folder.ts";
import { move } from "@std/fs";

async function getMp4Duration(thumbnail: ThumbnailRequest) {
  const command = new Deno.Command("ffprobe", {
    args: [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      thumbnail.filePath,
    ],
  });
  const result = await command.output();
  const text = new TextDecoder().decode(result.stdout);
  return Number.parseFloat(text);
}

export async function createMp4Thumbnail(thumbnail: ThumbnailRequest) {
  const duration = (await getMp4Duration(thumbnail)) || 100;
  const position = duration * 0.25;
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
      `${position}`,
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
