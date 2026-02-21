import { exists } from '@std/fs/exists';
import { resolve } from '@std/path/resolve';
import { FileTreeCache, globalFileTreeCache } from './file-tree-cache.ts';
import { join } from '@std/path';

export type PathResult = { type: 'invalid' } | {
    type: 'valid';
    fullPath: string;
    exists: boolean;
};

export type ListDirectorySuccess = {
    type: 'found';
    dirPath: string;
    files: Deno.DirEntry[];
};

export type ListDirectoryResult = {
    type: 'none';
} | ListDirectorySuccess;

export type StatResultSuccess = {
    type: 'valid';
    fullPath: string;
    info: Deno.FileInfo;
};

export type StatResult = {
    type: 'invalid';
} | StatResultSuccess;

export type ChangeRootResult = {
    type: 'invalid';
} | {
    type: 'valid';
    root: FileTree;
};

export class FileTree {
    private readonly root: string;
    private readonly treeCache: FileTreeCache = globalFileTreeCache;

    constructor(root: string) {
        this.root = Deno.realPathSync(root);
    }

    rootPath(): string {
        return this.root;
    }

    isValid(): Promise<boolean> {
        return exists(this.root, { isDirectory: true });
    }

    private async ensureResolveIsUnderRoot(
        suggestedPath: string,
    ): Promise<PathResult> {
        try {
            const realPath = await Deno.realPath(suggestedPath);
            return realPath.startsWith(this.root)
                ? { type: 'valid', fullPath: realPath, exists: true }
                : { type: 'invalid' };
        } catch {
            return suggestedPath.startsWith(this.root)
                ? { type: 'valid', fullPath: suggestedPath, exists: false }
                : { type: 'invalid' };
        }
    }

    async exists(relativePath: string): Promise<boolean> {
        const result = await this.resolvePath(relativePath);
        return result.type === 'valid' && result.exists;
    }

    async resolvePath(...relativePaths: string[]): Promise<PathResult> {
        try {
            const resolved = resolve(this.root, ...relativePaths);
            return await this.ensureResolveIsUnderRoot(resolved);
        } catch {
            return {
                type: 'invalid',
            };
        }
    }

    async listDirectory(relativePath: string): Promise<ListDirectoryResult> {
        const normalizedPath = join(this.root, relativePath);
        const pathCheck = await this.ensureResolveIsUnderRoot(normalizedPath);
        if (pathCheck.type === 'invalid' || !pathCheck.exists) {
            return {
                type: 'none',
            };
        }

        const cached = await this.treeCache.getByPath(normalizedPath);
        if (cached && cached.type === 'directory') {
            return {
                type: 'found',
                dirPath: pathCheck.fullPath,
                files: cached.subNodes.map((entry) => entry.dirEntry),
            };
        } else {
            return {
                type: 'none',
            };
        }
    }

    async stat(directory: ListDirectorySuccess, fileName: string): Promise<StatResult> {
        const normalizedPath = join(directory.dirPath, fileName);
        const pathCheck = await this.ensureResolveIsUnderRoot(normalizedPath);
        if (pathCheck.type === 'invalid') {
            return { type: 'invalid' };
        }

        const result = await this.treeCache.getByPath(normalizedPath);
        if (result && (result.type === 'file' || result.type === 'directory')) {
            return {
                type: 'valid',
                fullPath: pathCheck.fullPath,
                info: result.fileEntry,
            };
        } else {
            return {
                type: 'invalid',
            };
        }
    }

    async changeRoot(...relativePaths: string[]): Promise<ChangeRootResult> {
        const result = await this.resolvePath(...relativePaths);
        if (
            result.type === 'invalid' || !result.exists ||
            !(await Deno.lstat(result.fullPath)).isDirectory
        ) {
            return { type: 'invalid' };
        }
        return {
            type: 'valid',
            root: new FileTree(result.fullPath),
        };
    }

    async withSubfolderOrThrow(...relativePath: string[]): Promise<FileTree> {
        const result = await this.changeRoot(...relativePath);
        if (result.type === 'invalid') {
            throw new Error(`Expected to be able to change root to ${relativePath} but could not`);
        }
        return result.root;
    }
}
