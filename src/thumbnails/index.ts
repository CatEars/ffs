import { Router } from "@oak/oak/router";
import { logger } from "../logging/logger.ts";
import { ThumbnailRequest } from "./types.ts";
import { registerGetThumbnail } from "./get-thumbnail.ts";

export function areThumbnailsAvailable() {
  const proc = runFfmpegVersion();
  if (proc === false) {
    return false;
  }
  const stdout = new TextDecoder().decode(proc.stdout);
  return proc.success && isFfmpegVersionString(stdout);
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
    // Intentionally left empty
    return false;
  }
}

function isFfmpegVersionString(programOutput: string) {
  return /^ffmpeg version \d.\d.\d/.test(programOutput);
}

export function registerAllThumbnailRoutes(router: Router) {
  registerGetThumbnail(router);
}
