import { join } from '@std/path/join';
import { collectAsync } from '../utils/collect-async.ts';
import { logger } from '../logging/logger.ts';

type BaseNode = {
    type: 'file' | 'directory';
    hash: string;
    cachedAt: number;
};

type FileNode = BaseNode & {
    type: 'file';
    fileEntry: Deno.FileInfo;
};

type DirectorySubNode = {
    nodeHash: string;
    dirEntry: Deno.DirEntry;
};

type DirectoryNode = BaseNode & {
    type: 'directory';
    subNodes: DirectorySubNode[];
};

type FileSystemNode = FileNode | DirectoryNode;

const encoder = new TextEncoder();

async function convertPathToHash(path: string): Promise<string> {
    const data = encoder.encode(path);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((x) => x.toString(16).padStart(2, '0')).join('');
}

export class FileTreeCache {
    private readonly _hashmap: Map<string, FileSystemNode> = new Map();
    private readonly _maxCacheTimeMs: number = 1000 * 60 * 5;

    async getByPath(path: string): Promise<FileSystemNode | undefined> {
        const hash = await convertPathToHash(path);
        const hashedEntry = await this.getByPath(hash);
        if (hashedEntry) {
            return hashedEntry;
        }

        return this.cachePathWithKnownHash(path, hash);
    }

    getByHash(hash: string): Promise<FileSystemNode | undefined> {
        const entry = this._hashmap.get(hash);
        const isOutdated = entry && entry.cachedAt < (Date.now() - this._maxCacheTimeMs);
        if (isOutdated) {
            return Promise.resolve(undefined);
        }
        return Promise.resolve(entry);
    }

    async getByHashOrPath(hash: string, path: string): Promise<FileSystemNode | undefined> {
        const hashedEntry = await this.getByHash(hash);
        if (hashedEntry) {
            return hashedEntry;
        }

        return await this.getByPath(path);
    }

    async cachePath(path: string): Promise<FileSystemNode | undefined> {
        const hash = await convertPathToHash(path);
        return await this.cachePathWithKnownHash(path, hash);
    }

    private async cachePathWithKnownHash(
        path: string,
        knownHash: string,
    ): Promise<FileSystemNode | undefined> {
        try {
            const fileInfo = await Deno.lstat(path);
            if (fileInfo.isDirectory) {
                return await this.readAndCacheDirectory(path, knownHash);
            } else if (fileInfo.isFile) {
                const fileNode: FileNode = {
                    type: 'file',
                    hash: knownHash,
                    cachedAt: Date.now(),
                    fileEntry: fileInfo,
                };
                return fileNode;
            } else {
                return undefined;
            }
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                return undefined;
            }
            throw error;
        }
    }

    private async readAndCacheDirectory(path: string, knownHash: string): Promise<DirectoryNode> {
        const directoryEntry = await collectAsync(Deno.readDir(path));
        const subNodes: DirectorySubNode[] = await Promise.all(
            directoryEntry.map(async (dirEntry) => ({
                dirEntry,
                nodeHash: await convertPathToHash(join(path, dirEntry.name)),
            })),
        );
        const directoryNode: DirectoryNode = {
            type: 'directory',
            hash: knownHash,
            cachedAt: Date.now(),
            subNodes,
        };
        this._hashmap.set(directoryNode.hash, directoryNode);
        return directoryNode;
    }

    async cacheTree(startingPath: string): Promise<void> {
        // Breadth-first search to cache a file tree with `visited`
        const queue = [startingPath];
        const visited = new Set<string>();
        visited.add(startingPath);

        // Use a `min` function to ensure we never search more than a limit
        const maxDirectorySearchLimit = 100_000;
        for (let idx = 0; idx < Math.min(queue.length, maxDirectorySearchLimit); ++idx) {
            const currentPath = queue[idx];
            const entry = await this.cachePath(currentPath);
            if (!entry || entry.type === 'file') {
                continue;
            }
            const directory: DirectoryNode = entry;

            const subDirectories = directory.subNodes.filter((x) => x.dirEntry.isDirectory);
            for (const subDirectory of subDirectories) {
                const nextPath = join(currentPath, subDirectory.dirEntry.name);
                if (!visited.has(nextPath)) {
                    visited.add(nextPath);
                    queue.push(nextPath);
                }
            }
        }
    }

    async invalidatePathInCache(path: string): Promise<void> {
        await this.invalidateHashInCache(await convertPathToHash(path));
    }

    invalidateHashInCache(hash: string): Promise<void> {
        this._hashmap.delete(hash);
        return Promise.resolve();
    }
}

export const globalFileTreeCache = new FileTreeCache();

export function startFileTreeCacheBackgroundProcess(rootPath: string) {
    setInterval(async () => {
        logger.debug('Updating file tree cache for quick file access');
        await globalFileTreeCache.cacheTree(rootPath);
    }, 1000 * 60 * 2.5);
}
