import { join, relative, resolve } from '@std/path';
import { devModeEnabled, getCacheRoot, getStoreRoot } from '../config.ts';
import { FileTreeWalker } from './file-tree-walker.ts';
import { logger } from '../logging/logger.ts';
import { existsSync } from 'node:fs';

const cachePrefix = 'ffs-cachedir-';
const THUMBNAILS_SUBDIR = 'thumbnails';
const MANIFESTS_SUBDIR = 'share-manifests';
const knownThumbnails = new Map<string, Deno.FileInfo>();
let initialScanCompleted = false;

export function getThumbnailsDir(): string {
    return join(getCacheRoot(), THUMBNAILS_SUBDIR);
}

export function getManifestsDir(): string {
    return join(getCacheRoot(), MANIFESTS_SUBDIR);
}

async function scanForThumbnails() {
    const root = getThumbnailsDir();
    const fileTreeWalker = new FileTreeWalker(root, {
        includeFiles: true,
        includeSymlinks: false,
        includeDirs: false,
        match: [new RegExp('\.webp$', 'gi')],
    });

    for await (const entry of fileTreeWalker.walk()) {
        const fullPath = join(root, entry.parent, entry.name);
        try {
            knownThumbnails.set(fullPath, await Deno.stat(fullPath));
        } catch (err) {
            logger.debug('got', err, 'when trying to scan for thumbnails');
        }
    }

    initialScanCompleted = true;
}

async function priorTempDirectory() {
    try {
        for await (const entry of Deno.readDir(resolve('/', 'tmp'))) {
            if (entry.isDirectory && entry.name.startsWith(cachePrefix)) {
                return resolve('/', 'tmp', entry.name);
            }
        }
    } catch {
        // Intetionally left empty
    }
}

export async function resolveCacheFolder() {
    const envEntry = Deno.env.get('FFS_CACHE_FOLDER');
    const prior: string | undefined = await priorTempDirectory();
    if (envEntry && (await Deno.stat(envEntry)).isDirectory) {
        return envEntry;
    } else if (prior) {
        return prior;
    } else {
        return await Deno.makeTempDir({ prefix: cachePrefix });
    }
}

export function getThumbnailPath(filePath: string) {
    const storeRoot = getStoreRoot();
    const relPath = relative(storeRoot, filePath);
    return resolve(getThumbnailsDir(), relPath + '.webp');
}

function isOutdated(thumbnailFileInfo: Deno.FileInfo) {
    const now = new Date();
    const twelveHoursAgo = now.getTime() - (12 * 60 * 60 * 1000);
    const lastModified = thumbnailFileInfo.mtime;
    return (lastModified?.getTime() || 0) < twelveHoursAgo;
}

export function thumbnailExists(filePath: string): boolean {
    const thumbnailPath = getThumbnailPath(filePath);
    if (initialScanCompleted) {
        const entry = knownThumbnails.get(thumbnailPath);
        return !!entry && !isOutdated(entry);
    } else if (existsSync(thumbnailPath)) {
        const entry = Deno.statSync(thumbnailPath);
        return entry && !isOutdated(entry);
    } else {
        return false;
    }
}

export async function startThumbnailScanning() {
    await Deno.mkdir(getThumbnailsDir(), { recursive: true });
    setTimeout(scanForThumbnails, devModeEnabled ? 1 : 2_500);
    setInterval(scanForThumbnails, devModeEnabled ? 10_000 : 60_000);
}
