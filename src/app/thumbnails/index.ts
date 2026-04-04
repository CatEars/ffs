import { extname } from '@std/path/extname';
import { logger } from '../logging/loggers.ts';
import { ThumbnailRequest } from './types.ts';

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

let thumbnailWorker: Worker | undefined;

export function startThumbnailBackgroundProcess() {
    thumbnailWorker = new Worker(
        new URL('./worker/background-task.ts', import.meta.url).href,
        { type: 'module' },
    );
}

export function prioritizeThumbnail(filePath: string) {
    if (thumbnailWorker !== undefined) {
        try {
            // This isn't necessarily true, but for prioritizing thumbnails
            // it is okay enough. E.g. ".d" directories are an exception to this.
            const isFile = extname(filePath).length > 0;
            const isDirectory = !isFile;
            const data: ThumbnailRequest = {
                filePath,
                isFile,
                isDirectory,
            };
            thumbnailWorker.postMessage(data);
        } catch (err) {
            logger.warn(
                'Tried to prioritize thumbnail',
                filePath,
                'but instead got error',
                err,
            );
        }
    }
}

function runFfmpegVersion() {
    try {
        return new Deno.Command('ffmpeg', { args: ['-version'] }).outputSync();
    } catch {
        return false;
    }
}

function runImageMagickVersion() {
    try {
        return new Deno.Command('convert', { args: ['-version'] }).outputSync();
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
