import { join } from '@std/path/join';
import { logger } from '../logging/logger.ts';
import { collectMap } from '../utils/collect-map.ts';
import { formatBytes } from '../utils/format-bytes.ts';
import {
    ExistsResult,
    fileSystemOptions,
    IFileSystem,
    ReadDirResult,
    shouldSkipPath,
    StatResult,
} from './file-system.ts';

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

function isFreshCacheEntry(cachedEntry: BaseNode) {
    return cachedEntry.cachedAt > Date.now() - fileSystemOptions.maxCacheTimeMs;
}

export class CachingFileSystem implements IFileSystem {
    private readonly hashmap: Map<string, FileSystemNode> = new Map();
    private readonly autoCacheStartingPoint: string;
    private readonly subFileSystem: IFileSystem;

    private registeredTimeout: number | undefined;
    private registeredInterval: number | undefined;

    constructor(cacheStartingPoint: string, subFileSystem: IFileSystem) {
        this.autoCacheStartingPoint = cacheStartingPoint;
        this.subFileSystem = subFileSystem;
    }

    async exists(path: string): Promise<ExistsResult> {
        const cachedEntry = this.hashmap.get(path);
        if (cachedEntry && isFreshCacheEntry(cachedEntry)) {
            return {
                type: 'success',
                exists: true,
            };
        }

        return await this.subFileSystem.exists(path);
    }

    async stat(path: string): Promise<StatResult> {
        const result = await this.getByPath(path);
        if (!result) {
            return {
                type: 'fail',
                message: `${path} could not be retrieved`,
            };
        }

        return {
            type: 'success',
            info: result.fileEntry,
        };
    }

    async readDir(path: string): Promise<ReadDirResult> {
        const result = await this.getByPath(path);
        if (!result) {
            return {
                type: 'fail',
                message: `${path} could not be retrieved`,
            };
        } else if (result.type === 'file') {
            return {
                type: 'fail',
                message: `${path} is a file`,
            };
        } else {
            return {
                type: 'success',
                entries: result.subNodes.map((x) => x.dirEntry),
            };
        }
    }

    async getByPath(path: string): Promise<FileSystemNode | undefined> {
        if (shouldSkipPath(path)) {
            return undefined;
        }

        const cachedEntry = this.hashmap.get(path);
        if (cachedEntry && isFreshCacheEntry(cachedEntry)) {
            // Lets give directories a stat, this tells us if there are changes to the file tree
            // Lets skip stating files, this makes directory navigation faster at the cost of
            // date times on files not being up to date within 5 minute window
            if (cachedEntry.type === 'file') {
                return cachedEntry;
            }

            const statInfo = await this.subFileSystem.stat(path);
            if (statInfo.type === 'success') {
                const unchangedSinceCached = statInfo.info.mtime &&
                    statInfo.info.mtime.getTime() <= cachedEntry.cachedAt;

                if (unchangedSinceCached) {
                    return cachedEntry;
                }
            }
        }

        return await this.cachePath(path);
    }

    async cachePath(path: string): Promise<FileSystemNode | undefined> {
        try {
            const fileInfo = await this.subFileSystem.stat(path);
            if (fileInfo.type === 'fail') {
                return undefined;
            }
            if (fileInfo.info.isDirectory) {
                const readDirResult = await this.subFileSystem.readDir(path);
                if (readDirResult.type === 'fail') {
                    return undefined;
                }
                const subNodes: DirectorySubNode[] = readDirResult.entries.map((dirEntry) => ({
                    dirEntry,
                }));
                const directoryNode: DirectoryNode = {
                    type: 'directory',
                    fileEntry: fileInfo.info,
                    cachedAt: Date.now(),
                    subNodes,
                };
                this.hashmap.set(path, directoryNode);
                return directoryNode;
            } else if (fileInfo.info.isFile) {
                const fileNode: FileNode = {
                    type: 'file',
                    cachedAt: Date.now(),
                    fileEntry: fileInfo.info,
                };
                this.hashmap.set(path, fileNode);
                return fileNode;
            } else {
                return undefined;
            }
        } catch {
            /* Intentionally left empty */
        }
    }

    async cacheTree(startingPath: string): Promise<void> {
        logger.debug(
            'Updating file tree cache for quick file access. Pre size:',
            this.estimateSize(),
        );
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
        logger.debug(
            'Done updating file tree cache. Post size:',
            this.estimateSize(),
        );
    }

    invalidatePathInCache(path: string): void {
        this.hashmap.delete(path);
    }

    estimateSize() {
        const estimatedSize = JSON.stringify(collectMap(this.hashmap.values())).length;
        return formatBytes(estimatedSize);
    }

    goLive(): Promise<void> {
        this.registeredTimeout = setTimeout(async () => {
            try {
                await this.cacheTree(this.autoCacheStartingPoint);
            } catch {
                /* Intentionally left empty */
            }
        }, 1000 * 2.5);
        this.registeredInterval = setInterval(async () => {
            try {
                await this.cacheTree(this.autoCacheStartingPoint);
            } catch {
                /* Intentionally left empty */
            }
        }, 1000 * 60 * 2.5);
        return Promise.resolve();
    }

    goOffline(): Promise<void> {
        clearTimeout(this.registeredTimeout);
        clearInterval(this.registeredInterval);
        return Promise.resolve();
    }
}
