import { resolve } from '@std/path/resolve';
import { ExistsResult, IFileSystem, ReadDirResult, StatResult } from './file-system.ts';

export class RestrictingFileSystem implements IFileSystem {
    private readonly root: string;
    private readonly subFileSystem: IFileSystem;

    constructor(root: string, subFileSystem: IFileSystem) {
        this.root = Deno.realPathSync(root);
        this.subFileSystem = subFileSystem;
    }

    exists(path: string): Promise<ExistsResult> {
        if (!this.isPathUnderRoot(path)) {
            return Promise.resolve({
                type: 'fail',
                message: `${path} not under expected root ${this.root}`,
            });
        }

        return this.subFileSystem.exists(path);
    }

    stat(path: string): Promise<StatResult> {
        if (!this.isPathUnderRoot(path)) {
            return Promise.resolve({
                type: 'fail',
                message: `${path} not under expected root ${this.root}`,
            });
        }

        return this.subFileSystem.stat(path);
    }

    readDir(path: string): Promise<ReadDirResult> {
        if (!this.isPathUnderRoot(path)) {
            return Promise.resolve({
                type: 'fail',
                message: `${path} not under expected root ${this.root}`,
            });
        }

        return this.subFileSystem.readDir(path);
    }

    goLive(): Promise<void> {
        return Promise.resolve();
    }

    goOffline(): Promise<void> {
        return Promise.resolve();
    }

    restrictFurther(...relativePaths: string[]) {
        const updatedPath = resolve(this.root, ...relativePaths);
        if (!this.isPathUnderRoot) {
            throw new Error(
                `Tried to restrict access to under ${this.root}, but got ${updatedPath}`,
            );
        }

        return new RestrictingFileSystem(updatedPath, this.subFileSystem);
    }

    private isPathUnderRoot(suggestedPath: string): boolean {
        const resolvedPath = resolve(suggestedPath);
        return suggestedPath.startsWith(resolvedPath);
    }
}
