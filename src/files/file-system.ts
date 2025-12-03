import { exists } from '@std/fs/exists';
import { collectAsync } from '../utils/collect-async.ts';

export type StatResultSuccess = {
    type: 'success';
    info: Deno.FileInfo;
};

export type StatResultFail = {
    type: 'fail';
    message: string;
};

export type StatResult = StatResultFail | StatResultSuccess;

export type ReadDirSuccess = {
    type: 'success';
    entries: Deno.DirEntry[];
};

export type ReadDirFail = {
    type: 'fail';
    message: string;
};

export type ReadDirResult = ReadDirFail | ReadDirSuccess;

export type ExistsFail = {
    type: 'fail';
    message: string;
};

export type ExistsSuccess = {
    type: 'success';
    exists: boolean;
};

export type ExistsResult = ExistsFail | ExistsSuccess;

export interface IFileSystem {
    stat(path: string): Promise<StatResult>;
    readDir(path: string): Promise<ReadDirResult>;
    exists(path: string): Promise<ExistsResult>;

    goLive(): Promise<void>;
    goOffline(): Promise<void>;
}

export function shouldSkipPath(path: string) {
    return fileSystemOptions.skip.some((skipper) => skipper.test(path));
}

export class DefaultFileSystem implements IFileSystem {
    async stat(path: string): Promise<StatResult> {
        if (shouldSkipPath(`${path}`)) {
            return {
                type: 'fail',
                message: `${path} is skippable path`,
            };
        }
        try {
            const result = await Deno.stat(path);
            return { type: 'success', info: result };
        } catch (err) {
            return { type: 'fail', message: `${err}` };
        }
    }

    async readDir(path: string): Promise<ReadDirResult> {
        if (shouldSkipPath(`${path}`)) {
            return {
                type: 'fail',
                message: `${path} is skippable path`,
            };
        }
        try {
            const result = await collectAsync(Deno.readDir(path));
            return { type: 'success', entries: result };
        } catch (err) {
            return { type: 'fail', message: `${err}` };
        }
    }

    async exists(path: string): Promise<ExistsResult> {
        if (shouldSkipPath(path)) {
            return {
                type: 'fail',
                message: `${path} is skippable path`,
            };
        }

        try {
            const result = await exists(path);
            return { type: 'success', exists: result };
        } catch (err) {
            return { type: 'fail', message: `${err}` };
        }
    }

    goLive(): Promise<void> {
        return Promise.resolve();
    }

    goOffline(): Promise<void> {
        return Promise.resolve();
    }
}

export async function useFileSystemImplementation(newFileSystem: IFileSystem) {
    await fileSystem.goOffline();
    fileSystem = newFileSystem;
    await newFileSystem.goLive();
}

export let fileSystem: IFileSystem = new DefaultFileSystem();

export type FileSystemOptions = {
    skip: RegExp[];
    maxCacheTimeMs: number;
};

export let fileSystemOptions: FileSystemOptions = {
    skip: [],
    maxCacheTimeMs: 1000 * 60 * 5,
};
