import { logger } from "../logging/logger.ts";

function runFfmpegVersion() {
  return new Deno.Command("ffmpeg", { args: ["-version"] }).outputSync();
}

export function areThumbnailsAvailable() {
  const proc = runFfmpegVersion();

  const stdout = new TextDecoder().decode(proc.stdout);
  logger.info(stdout, proc.success, new TextDecoder().decode(proc.stderr));
  return proc.success && isFfmpegVersionString(stdout);
}

function isFfmpegVersionString(programOutput: string) {
  return /^ffmpeg version \d.\d.\d/.test(programOutput);
}
