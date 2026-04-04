import { extname } from '@std/path/extname';
import { relative } from '@std/path/relative';
import { sleep } from '../../../lib/sleep/sleep.ts';
import { getThumbnailsDir } from '../../files/cache-folder.ts';
import { logger } from '../../logging/loggers.ts';
import {
    ThumbnailRequest,
    ThumbnailResult,
    ThumbnailWorkerFoundThumbnail,
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

type ThumbnailWaiter = {
    resolveOk: (data: ThumbnailWorkerFoundThumbnail) => void;
    resolveNotFound: () => void;
    createdAt: number;
};

let thumbnailWorker: Worker | undefined;
const waitingPromises = new Map<string, ThumbnailWaiter>();

export function startThumbnailBackgroundProcess() {
    thumbnailWorker = new Worker(
        new URL('./background-task.ts', import.meta.url).href,
        { type: 'module' },
    );

    let resolveEchoPromise = () => {};
    const echoPromise = new Promise<void>((resolve) => {
        resolveEchoPromise = resolve;
    });
    thumbnailWorker.onmessage = (message: MessageEvent<ThumbnailWorkerResponse>) => {
        if (message.data.type === 'echo') {
            resolveEchoPromise();
            return;
        }
        const foundPromise = waitingPromises.get(message.data.id);
        if (!foundPromise) {
            return;
        }

        if (message.data.type === 'thumbnail-found') {
            foundPromise.resolveOk(message.data);
        } else if (message.data.type === 'thumbnail-not-found') {
            foundPromise.resolveNotFound();
        }
    };

    // Make sure that waiting promises do not leak memory
    setInterval(() => {
        const now = Date.now();
        waitingPromises.entries()
            .filter(([_, entry]) => entry.createdAt + 60_000 < now)
            .forEach(([id]) => {
                waitingPromises.delete(id);
            });
    }, 50_000);
    const int = setInterval(() => {
        thumbnailWorker?.postMessage({ type: 'echo' });
    }, 100);
    echoPromise.then(() => {
        clearInterval(int);
    });
    return echoPromise;
}

export function activateThumbnailWorker() {
    if (thumbnailWorker !== undefined) {
        thumbnailWorker.postMessage({
            type: 'activate',
        });
    }
}

export function deactivateThumbnailWorker() {
    if (thumbnailWorker !== undefined) {
        thumbnailWorker.postMessage({
            type: 'deactivate',
        });
    }
}

export async function getThumbnailLocationQuicklyOrSkip(
    filePath: string,
): Promise<ThumbnailResult> {
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
            const id: string = crypto.randomUUID();
            const request: ThumbnailWorkerRequest = {
                type: 'create-thumbnail',
                id,
                ...data,
            };
            const sleeper = sleep(5050);
            let resolver = () => {};
            let rejecter = () => {};
            let result: null | ThumbnailWorkerFoundThumbnail = null;
            const resolverPromise = new Promise<void>((resolve, reject) => {
                resolver = () => resolve();
                rejecter = () => reject();
                try {
                    // Ensure that this promise at least rejects based on the sleep
                    sleeper.then(() => rejecter());
                } catch {
                    // Intentionally left empty
                }
            });
            const waiter: ThumbnailWaiter = {
                resolveOk: (data: ThumbnailWorkerFoundThumbnail) => {
                    result = data;
                    resolver();
                },
                resolveNotFound: () => {
                    rejecter();
                },
                createdAt: Date.now(),
            };
            waitingPromises.set(id, waiter);
            thumbnailWorker.postMessage(request);
            await Promise.race([sleeper, resolverPromise]).catch(() => {
                // Intentionally left empty
            });
            waitingPromises.delete(id);
            if (result != null) {
                // deno does seem to handle cases where a variable is set outside the scope of the current function
                // deno-lint-ignore no-explicit-any
                const res: any = result;
                const thumbnailsDir = getThumbnailsDir();
                return {
                    type: 'thumbnail-found',
                    root: thumbnailsDir,
                    path: relative(thumbnailsDir, res.path),
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
