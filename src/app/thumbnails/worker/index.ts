import { extname } from '@std/path/extname';
import { relative } from '@std/path/relative';
import { WorkerRpc } from '../../../lib/worker-rpc/worker-rpc.ts';
import { getThumbnailsDir } from '../../files/cache-folder.ts';
import { logger } from '../../logging/loggers.ts';
import {
    ThumbnailRequest,
    ThumbnailResult,
    ThumbnailWorkerRequest,
    ThumbnailWorkerResponse,
} from '../types.ts';

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

export function startThumbnailBackgroundProcess() {
    const worker = new Worker(
        new URL('./background-task.ts', import.meta.url).href,
        { type: 'module' },
    );

    thumbnailRpc = WorkerRpc.buildFromMain<ThumbnailWorkerRequest, ThumbnailWorkerResponse>(worker);

    let resolveEchoPromise = () => {};
    const echoPromise = new Promise<void>((resolve) => {
        resolveEchoPromise = resolve;
    });

    thumbnailRpc.on('echo', (_) => {
        resolveEchoPromise();
    });

    const int = setInterval(() => {
        thumbnailRpc?.post({ type: 'echo' });
    }, 100);
    echoPromise.then(() => {
        clearInterval(int);
    });
    return echoPromise;
}

export function activateThumbnailWorker() {
    thumbnailRpc?.post({ type: 'activate' });
}

export function deactivateThumbnailWorker() {
    thumbnailRpc?.post({ type: 'deactivate' });
}

export async function getThumbnailLocationQuicklyOrSkip(
    filePath: string,
): Promise<ThumbnailResult> {
    if (thumbnailRpc !== undefined) {
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
            const id: string = crypto.randomUUID();
            const request: ThumbnailWorkerRequest = {
                type: 'create-thumbnail',
                id,
                ...data,
            };
            const result = await thumbnailRpc.request(request);
            if (result !== null && result.type === 'thumbnail-found') {
                const thumbnailsDir = getThumbnailsDir();
                return {
                    type: 'thumbnail-found',
                    root: thumbnailsDir,
                    path: relative(thumbnailsDir, result.path),
                };
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
    };
}
