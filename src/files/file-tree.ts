import { exists, existsSync } from '@std/fs/exists';
import { resolve } from '@std/path/resolve';
import { FileTreeCache, globalFileTreeCache } from './file-tree-cache.ts';

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

export type StatResult = {
    type: 'invalid';
} | {
    type: 'valid';
    fullPath: string;
    info: Deno.FileInfo;
};

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

    private ensureResolveIsUnderRoot(
        suggestedPath: string,
        pathHasFile: boolean,
    ): PathResult {
        if (suggestedPath.startsWith(this.root)) {
            return {
                type: 'valid',
                fullPath: suggestedPath,
                exists: pathHasFile,
            };
        } else {
            return {
                type: 'invalid',
            };
        }
    }

    async exists(relativePath: string): Promise<boolean> {
        const result = await this.resolvePath(relativePath);
        return result.type === 'valid' && result.exists;
    }

    async resolvePath(...relativePaths: string[]): Promise<PathResult> {
        try {
            const resolved = resolve(this.root, ...relativePaths);
            if (existsSync(resolved)) {
                const realPath = Deno.realPathSync(resolved);
                return await this.ensureResolveIsUnderRoot(realPath, true);
            } else {
                return await this.ensureResolveIsUnderRoot(resolved, false);
            }
        } catch {
            return {
                type: 'invalid',
            };
        }
    }

    async listDirectory(relativePath: string): Promise<ListDirectoryResult> {
        const dir = await this.resolvePath(relativePath);
        if (dir.type === 'invalid') {
            return { type: 'none' };
        }
        try {
            return {
                type: 'found',
                dirPath: dir.fullPath,
                files: Deno.readDirSync(dir.fullPath).toArray(),
            };
        } catch {
            return { type: 'none' };
        }
    }

    async stat(directory: ListDirectorySuccess, fileName: string): Promise<StatResult> {
        const resolved = await this.resolvePath(directory.dirPath, fileName);
        if (resolved.type === 'invalid') {
            return { type: 'invalid' };
        } else {
            try {
                return {
                    type: 'valid',
                    fullPath: resolved.fullPath,
                    info: Deno.statSync(resolved.fullPath),
                };
            } catch {
                return {
                    type: 'invalid',
                };
            }
        }
    }

    async changeRoot(...relativePaths: string[]): Promise<ChangeRootResult> {
        const result = await this.resolvePath(...relativePaths);
        if (
            result.type === 'invalid' || !result.exists ||
            !Deno.statSync(result.fullPath).isDirectory
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
