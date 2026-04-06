import { ensureDir } from '@std/fs/ensure-dir';
import { join } from '@std/path/join';
import { Channel } from '../../../lib/channel/channel.ts';
import { WorkerRpc } from '../../../lib/worker-rpc/worker-rpc.ts';
import { devModeEnabled, getCacheRoot, getStoreRoot } from '../../config.ts';
import { getDiskUsageCacheDir } from '../../files/cache-folder.ts';
import { logger } from '../../logging/loggers.ts';
import { DiskUsageWorkerRequest, DiskUsageWorkerResponse } from '../types.ts';

type CacheEntry = { sizeBytes: number; scannedAt: number };

const usageCache = new Map<string, CacheEntry>();
const priorityChannel: Channel<string> = new Channel();
let activated = false;

const CACHE_FILE_NAME = 'cache.json';
const SCAN_INTERVAL_MS = devModeEnabled ? 30_000 : 5 * 60_000;
const STALE_THRESHOLD_MS = devModeEnabled ? 60_000 : 10 * 60_000;

async function loadCacheFromDisk(): Promise<void> {
    const cacheFile = join(getDiskUsageCacheDir(), CACHE_FILE_NAME);
    try {
        const data = await Deno.readTextFile(cacheFile);
        const entries = JSON.parse(data) as Array<[string, CacheEntry]>;
        for (const [path, entry] of entries) {
            usageCache.set(path, entry);
        }
        logger.debug('Loaded disk usage cache from', cacheFile, '(', usageCache.size, 'entries)');
    } catch {
        // Cache file does not exist yet — that is fine on first run
    }
}

async function saveCacheToDisk(): Promise<void> {
    const cacheDir = getDiskUsageCacheDir();
    await ensureDir(cacheDir);
    const cacheFile = join(cacheDir, CACHE_FILE_NAME);
    const entries = Array.from(usageCache.entries());
    await Deno.writeTextFile(cacheFile, JSON.stringify(entries));
}

/**
 * Recursively sums the sizes of all files under `dirPath` and caches every
 * intermediate directory it visits along the way.  Returns the total byte
 * count for `dirPath`.
 */
async function scanDirectory(dirPath: string): Promise<number> {
    let total = 0;
    try {
        for await (const entry of Deno.readDir(dirPath)) {
            const entryPath = join(dirPath, entry.name);
            if (entry.isFile) {
                try {
                    const stat = await Deno.stat(entryPath);
                    total += stat.size ?? 0;
                } catch {
                    // Ignore files we cannot stat (e.g. broken symlinks)
                }
            } else if (entry.isDirectory) {
                const subdirSize = await scanDirectory(entryPath);
                usageCache.set(entryPath, { sizeBytes: subdirSize, scannedAt: Date.now() });
                total += subdirSize;
            }
        }
    } catch {
        // Ignore directories we cannot read (e.g. permission denied)
    }
    return total;
}

async function runFullScan(): Promise<void> {
    if (!activated) {
        return;
    }
    logger.debug('Disk usage worker: starting full scan');
    const storeRoot = getStoreRoot();
    const rootSize = await scanDirectory(storeRoot);
    usageCache.set(storeRoot, { sizeBytes: rootSize, scannedAt: Date.now() });
    await saveCacheToDisk();
    logger.debug('Disk usage worker: full scan complete, cache has', usageCache.size, 'entries');
}

/**
 * Scans a single directory (and all its descendants) when it was not yet
 * cached or has become stale.  Used for priority requests.
 */
async function runPriorityScan(dirPath: string): Promise<void> {
    const size = await scanDirectory(dirPath);
    usageCache.set(dirPath, { sizeBytes: size, scannedAt: Date.now() });
}

const me: Worker = self as unknown as Worker;

async function main() {
    logger.debug(
        'Disk usage background worker started. Cache root:',
        getCacheRoot(),
    );

    if (!me) {
        logger.debug('Disk usage worker does not hold reference to self, unable to set up communication');
        return;
    }

    await loadCacheFromDisk();

    const rpc = WorkerRpc.buildFromWorker<DiskUsageWorkerRequest, DiskUsageWorkerResponse>(me);

    rpc.on('get-usage', (msg) => {
        if (msg.type !== 'get-usage') {
            return;
        }
        const cached = usageCache.get(msg.path);
        // Respond immediately with whatever is in the cache (may be null)
        rpc.post({
            type: 'usage-result',
            id: msg.id,
            sizeBytes: cached?.sizeBytes ?? null,
        });
        // Queue this path for a priority scan if the cache entry is missing or stale
        const isStale = !cached || Date.now() - cached.scannedAt > STALE_THRESHOLD_MS;
        if (isStale) {
            priorityChannel.pushFirst(msg.path);
        }
    });

    rpc.on('activate', (_) => {
        activated = true;
        logger.info('Disk usage background worker activated');
        // Kick off the first full scan immediately now that we are active
        runFullScan();
    });

    rpc.on('deactivate', (_) => {
        activated = false;
        logger.info('Disk usage background worker deactivated');
    });

    // Repeat the full scan on a schedule; the first scan is triggered on activation
    setInterval(runFullScan, SCAN_INTERVAL_MS);

    // Drain the priority queue in the background
    while (true) {
        const path = await priorityChannel.consume();
        if (path === null) {
            continue;
        }
        await runPriorityScan(path);
    }
}

if (import.meta.main) {
    main().catch((err) => {
        logger.warn('Disk usage background worker crashed:', err);
    });
}
