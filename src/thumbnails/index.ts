import { Router } from "@oak/oak/router";
import { logger } from "../logging/logger.ts";
import { ThumbnailRequest } from "./types.ts";
import { registerGetThumbnail } from "./get-thumbnail.ts";

function isFfmpegAvailable() {
  const proc = runFfmpegVersion();
  if (proc === false) {
    return false;
  }
  const stdout = new TextDecoder().decode(proc.stdout);
  return proc.success && isFfmpegVersionString(stdout);
}

function isImageMagickAvailable() {
  const proc = runImageMagickVersion();
  if (proc === false) {
    return false;
  }
  const stdout = new TextDecoder().decode(proc.stdout);
  return proc.success && isImageMagickVersion(stdout);
}

export function areThumbnailsAvailable() {
  return isFfmpegAvailable() && isImageMagickAvailable();
}

let thumbnailProcess: Deno.ChildProcess | undefined;
let thumbnailProcessStdin:
  | WritableStreamDefaultWriter<Uint8Array<ArrayBufferLike>>
  | undefined;

export function startThumbnailBackgroundProcess() {
  const subProcessFlags = [
    "--allow-env",
    "--allow-read",
    "--allow-write",
    "--allow-run",
  ];

  thumbnailProcess = new Deno.Command("deno", {
    args: subProcessFlags.concat(["src/thumbnails/background-task.ts"]),
    stdin: "piped",
  }).spawn();
  thumbnailProcessStdin = thumbnailProcess.stdin.getWriter();
}

export async function prioritizeThumbnail(filePath: string) {
  if (thumbnailProcess !== null) {
    try {
      const data: ThumbnailRequest = {
        filePath,
      };
      const bytes = new TextEncoder().encode(JSON.stringify(data) + "\n");

      await thumbnailProcessStdin?.write(bytes);
    } catch (err) {
      console.warn(err);
      logger.warn(
        "Tried to prioritize thumbnail",
        filePath,
        "but instead got error",
        err,
      );
    }
  }
}

function runFfmpegVersion() {
  try {
    return new Deno.Command("ffmpeg", { args: ["-version"] }).outputSync();
  } catch {
    return false;
  }
}

function runImageMagickVersion() {
  try {
    return new Deno.Command("convert", { args: ["-version"] }).outputSync();
  } catch {
    return false;
  }
}

function isFfmpegVersionString(programOutput: string) {
  return /^ffmpeg version \d\.\d\.\d/.test(programOutput);
}

function isImageMagickVersion(programOutput: string) {
  return /^Version: ImageMagick \d\.\d\.\d/.test(programOutput);
}

export function registerAllThumbnailRoutes(router: Router) {
  registerGetThumbnail(router);
}
