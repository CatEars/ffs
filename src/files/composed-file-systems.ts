import { ExistsResult, IFileSystem, ReadDirResult, StatResult } from './file-system.ts';

export class ComposedFileSystems implements IFileSystem {
    private readonly rootFileSystem: IFileSystem;
    private readonly dependentFileSystems: IFileSystem[];

    constructor(rootFileSystem: IFileSystem, dependentFileSystems: IFileSystem[]) {
        this.rootFileSystem = rootFileSystem;
        this.dependentFileSystems = dependentFileSystems;
    }

    exists(path: string): Promise<ExistsResult> {
        return this.rootFileSystem.exists(path);
    }

    stat(path: string): Promise<StatResult> {
        return this.rootFileSystem.stat(path);
    }

    readDir(path: string): Promise<ReadDirResult> {
        return this.rootFileSystem.readDir(path);
    }

    async goLive(): Promise<void> {
        await tryCatch(this.rootFileSystem.goLive);
        for (const dependentFileSystem of this.dependentFileSystems) {
            await tryCatch(dependentFileSystem.goLive);
        }
    }

    async goOffline(): Promise<void> {
        await tryCatch(this.rootFileSystem.goOffline);
        for (const dependentFileSystem of this.dependentFileSystems) {
            await tryCatch(dependentFileSystem.goOffline);
        }
    }
}

async function tryCatch(action: () => Promise<void>) {
    try {
        await action();
    } catch {
        /* Intentionally left empty */
    }
}
