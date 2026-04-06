import { WorkerRpc } from '../../../lib/worker-rpc/worker-rpc.ts';
import { logger } from '../../logging/loggers.ts';
import { DiskUsageWorkerRequest, DiskUsageWorkerResponse } from '../types.ts';

const DISK_USAGE_REQUEST_TIMEOUT_MS = 5;

let diskUsageRpc: WorkerRpc<DiskUsageWorkerRequest, DiskUsageWorkerResponse> | undefined;

export async function startDiskUsageBackgroundProcess(): Promise<void> {
    const worker = new Worker(
        new URL('./background-task.ts', import.meta.url).href,
        { type: 'module' },
    );

    diskUsageRpc = WorkerRpc.buildFromMain<DiskUsageWorkerRequest, DiskUsageWorkerResponse>(worker);
    await diskUsageRpc.waitUntilEchoIsAvailable();
}

export function activateDiskUsageWorker(): void {
    diskUsageRpc?.post({ type: 'activate' });
}

export function deactivateDiskUsageWorker(): void {
    diskUsageRpc?.post({ type: 'deactivate' });
}

/**
 * Requests the cached disk usage for a single directory path.
 * Returns the size in bytes, or `null` if not yet cached.
 * Uses an ultra-short timeout so callers are never blocked.
 */
export async function getDiskUsageQuicklyOrNull(dirPath: string): Promise<number | null> {
    if (diskUsageRpc === undefined) {
        return null;
    }
    try {
        const id = crypto.randomUUID();
        const result = await diskUsageRpc.request(
            { type: 'get-usage', path: dirPath, id },
            { timeoutMs: DISK_USAGE_REQUEST_TIMEOUT_MS },
        );
        if (result?.type === 'usage-result') {
            return result.sizeBytes;
        }
    } catch (err) {
        logger.warn('Tried to get disk usage for', dirPath, 'but got error:', err);
    }
    return null;
}
