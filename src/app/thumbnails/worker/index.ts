import { WorkerRpc } from '../../../lib/worker-rpc/worker-rpc.ts';
import { logger } from '../../logging/loggers.ts';
import { ThumbnailRequest, ThumbnailWorkerRequest, ThumbnailWorkerResponse } from '../types.ts';

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

let thumbnailRpc: WorkerRpc<ThumbnailWorkerRequest, ThumbnailWorkerResponse> | undefined;

export async function startThumbnailBackgroundProcess() {
    const worker = new Worker(
        new URL('./background-task.ts', import.meta.url).href,
        { type: 'module' },
    );

    thumbnailRpc = WorkerRpc.buildFromMain<ThumbnailWorkerRequest, ThumbnailWorkerResponse>(worker);
    await thumbnailRpc.waitUntilEchoIsAvailable();
}

export function activateThumbnailWorker() {
    thumbnailRpc?.post({ type: 'activate' });
}

export function deactivateThumbnailWorker() {
    thumbnailRpc?.post({ type: 'deactivate' });
}

export async function getThumbnailLocationQuicklyOrNull(
    filePath: string,
): Promise<ThumbnailWorkerResponse> {
    if (thumbnailRpc !== undefined) {
        try {
            const data: ThumbnailRequest = {
                filePath,
            };
            const id: string = crypto.randomUUID();
            const request: ThumbnailWorkerRequest = {
                type: 'create-thumbnail',
                id,
                ...data,
            };
            const result = await thumbnailRpc.request(request);
            if (result !== null) {
                return result;
            }
        } catch (err) {
            logger.warn(
                'Tried to prioritize thumbnail',
                filePath,
                'but instead got error',
                err,
            );
        }
    }

    return {
        type: 'thumbnail-not-found',
        id: '',
    };
}
