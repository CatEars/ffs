import { existsSync } from '@std/fs/exists';
import { resolve } from '@std/path/resolve';

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

export class FileTree {
    private readonly root: string;

    constructor(root: string) {
        this.root = Deno.realPathSync(root);
    }

    isValid(): boolean {
        return existsSync(this.root, { isDirectory: true });
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

    exists(relativePath: string): boolean {
        const result = this.resolvePath(relativePath);
        return result.type === 'valid' && result.exists;
    }

    resolvePath(...relativePaths: string[]): PathResult {
        try {
            const resolved = resolve(this.root, ...relativePaths);
            if (existsSync(resolved)) {
                const realPath = Deno.realPathSync(resolved);
                return this.ensureResolveIsUnderRoot(realPath, true);
            } else {
                return this.ensureResolveIsUnderRoot(resolved, false);
            }
        } catch {
            return {
                type: 'invalid',
            };
        }
    }

    listDirectory(relativePath: string): ListDirectoryResult {
        const dir = this.resolvePath(relativePath);
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

    stat(directory: ListDirectorySuccess, fileName: string): StatResult {
        const resolved = this.resolvePath(directory.dirPath, fileName);
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
}
