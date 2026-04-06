import { ExecutableTester } from '../../../lib/exe-tester/exe-tester.ts';
import { WorkerRpc } from '../../../lib/worker-rpc/worker-rpc.ts';
import { logger } from '../../logging/loggers.ts';
import { ThumbnailRequest, ThumbnailWorkerRequest, ThumbnailWorkerResponse } from '../types.ts';

export const ffmpegTester = new ExecutableTester(
    'ffmpeg',
    ['-version'],
    /^ffmpeg version \d\.\d\.\d/,
);
export const imageMagickTester = new ExecutableTester(
    'convert',
    ['-version'],
    /^Version: ImageMagick \d\.\d\.\d/,
);

export async function areThumbnailsAvailable() {
    return (await ffmpegTester.isAvailable()) || (await imageMagickTester.isAvailable());
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
