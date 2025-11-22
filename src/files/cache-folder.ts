import { relative, resolve } from '@std/path';
import { getCacheRoot, getStoreRoot } from '../config.ts';
import { existsSync } from '@std/fs/exists';

const cachePrefix = 'ffs-cachedir-';

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
    const cacheRoot = getCacheRoot();

    const relPath = relative(storeRoot, filePath);
    return resolve(cacheRoot, relPath + '.webp');
}

function isOutdated(filePath: string) {
    const now = new Date();
    const twelveHoursAgo = now.getTime() - (12 * 60 * 60 * 1000);
    const lastModified = Deno.statSync(filePath).mtime;
    return (lastModified?.getTime() || 0) < twelveHoursAgo;
}

export function thumbnailExists(filePath: string) {
    const thumbnailPath = getThumbnailPath(filePath);
    const exists = existsSync(thumbnailPath);
    return exists && !isOutdated(thumbnailPath);
}
