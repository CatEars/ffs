import { join } from '@std/path/join';
import { collectAsync } from '../utils/collect-async.ts';
import { logger } from '../logging/logger.ts';
import { collectMap } from '../utils/collect-map.ts';
import { formatBytes } from '../utils/format-bytes.ts';

type BaseNode = {
    type: 'file' | 'directory';
    cachedAt: number;
};

type FileNode = BaseNode & {
    type: 'file';
    fileEntry: Deno.FileInfo;
};

type DirectorySubNode = {
    dirEntry: Deno.DirEntry;
};

type DirectoryNode = BaseNode & {
    type: 'directory';
    fileEntry: Deno.FileInfo;
    subNodes: DirectorySubNode[];
};

type FileSystemNode = FileNode | DirectoryNode;

export class FileTreeCache {
    private readonly _hashmap: Map<string, FileSystemNode> = new Map();
    private readonly _maxCacheTimeMs: number = 1000 * 60 * 5;

    async getByPath(path: string): Promise<FileSystemNode | undefined> {
        const cachedEntry = this._hashmap.get(path);

        if (cachedEntry) {
            const isUpToDate = cachedEntry.cachedAt > Date.now() - this._maxCacheTimeMs;
            if (isUpToDate) {
                // Lets give directories a stat, this tells us if there are changes to the file tree
                // Lets skip stating files, this makes directory navigation faster at the cost of
                // date times on files not being up to date within 5 minute window
                if (cachedEntry.type === 'file') {
                    return cachedEntry;
                }

                const statInfo = await Deno.stat(path);
                const unchangedSinceCached = statInfo.mtime &&
                    statInfo.mtime.getTime() <= cachedEntry.cachedAt;

                if (unchangedSinceCached) {
                    return cachedEntry;
                }
            }
        }

        return await this.cachePath(path);
    }

    async cachePath(path: string): Promise<FileSystemNode | undefined> {
        try {
            const fileInfo = await Deno.stat(path);
            if (fileInfo.isDirectory) {
                return await this.readAndCacheDirectory(path, fileInfo);
            } else if (fileInfo.isFile) {
                const fileNode: FileNode = {
                    type: 'file',
                    cachedAt: Date.now(),
                    fileEntry: fileInfo,
                };
                this._hashmap.set(path, fileNode);
                return fileNode;
            } else {
                return undefined;
            }
        } catch {
            /* Intentionally left empty */
        }
    }

    private async readAndCacheDirectory(
        path: string,
        fileInfo: Deno.FileInfo,
    ): Promise<DirectoryNode> {
        const directoryEntry = await collectAsync(Deno.readDir(path));
        const subNodes: DirectorySubNode[] = directoryEntry.map((dirEntry) => ({
            dirEntry,
        }));
        const directoryNode: DirectoryNode = {
            type: 'directory',
            fileEntry: fileInfo,
            cachedAt: Date.now(),
            subNodes,
        };
        this._hashmap.set(path, directoryNode);
        return directoryNode;
    }

    async cacheTree(startingPath: string): Promise<void> {
        // Breadth-first search to cache a file tree with `visited`
        const queue = [startingPath];
        const visited = new Set<string>();
        visited.add(startingPath);

        // Use a `min` function to ensure we never search more than a limit
        const maxDirectorySearchLimit = 10_000_000;
        for (let idx = 0; idx < Math.min(queue.length, maxDirectorySearchLimit); ++idx) {
            const currentPath = queue[idx];
            const entry = await this.cachePath(currentPath);
            if (!entry || entry.type === 'file') {
                continue;
            }

            const directory: DirectoryNode = entry;
            for (const subNode of directory.subNodes.filter((x) => !x.dirEntry.isSymlink)) {
                const nextPath = join(currentPath, subNode.dirEntry.name);
                if (!visited.has(nextPath)) {
                    visited.add(nextPath);
                    queue.push(nextPath);
                }
            }
        }
    }

    invalidatePathInCache(path: string): void {
        this._hashmap.delete(path);
    }

    estimateSize() {
        const estimatedSize = JSON.stringify(collectMap(this._hashmap.values())).length;
        return formatBytes(estimatedSize);
    }
}

export const globalFileTreeCache = new FileTreeCache();

async function runSingleGlobalFileTreeCacheUpdate(rootPath: string) {
    logger.debug(
        'Updating file tree cache for quick file access. Pre size:',
        globalFileTreeCache.estimateSize(),
    );
    await globalFileTreeCache.cacheTree(rootPath);
    logger.debug('Done updating file tree cache. Post size:', globalFileTreeCache.estimateSize());
}

export function startFileTreeCacheBackgroundProcess(rootPath: string) {
    setTimeout(async () => {
        await runSingleGlobalFileTreeCacheUpdate(rootPath);
    }, 1000 * 2.5);
    setInterval(async () => {
        await runSingleGlobalFileTreeCacheUpdate(rootPath);
    }, 1000 * 60 * 2.5);
}
