import { logger } from "../logging/logger.ts";
import { ThumbnailPrio } from "./type.ts";

export function areThumbnailsAvailable() {
  const proc = runFfmpegVersion();

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
      const data: ThumbnailPrio = {
        filePath,
      };
      const bytes = new TextEncoder().encode(JSON.stringify(data));

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
  return new Deno.Command("ffmpeg", { args: ["-version"] }).outputSync();
}

function isFfmpegVersionString(programOutput: string) {
  return /^ffmpeg version \d.\d.\d/.test(programOutput);
}
