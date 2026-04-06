import { Logger } from '../../lib/logger/logger.ts';
import { OptionalModule } from '../../lib/optional-module/optional-module.ts';
import {
    activateDiskUsageWorker,
    deactivateDiskUsageWorker,
    startDiskUsageBackgroundProcess,
} from './worker/index.ts';

class DiskUsageModule implements OptionalModule {
    private activated: boolean = false;
    public readonly name: string = 'Directory Disk Usage';
    public readonly description: string =
        'Periodically scans the file tree and calculates directory sizes for display in the file browser.';

    isAvailable(): Promise<boolean> {
        return Promise.resolve(true);
    }

    async init(): Promise<void> {
        await startDiskUsageBackgroundProcess();
    }

    isActivated(): boolean {
        return this.activated;
    }

    activate(): Promise<void> {
        activateDiskUsageWorker();
        this.activated = true;
        return Promise.resolve();
    }

    deactivate(): Promise<void> {
        deactivateDiskUsageWorker();
        this.activated = false;
        return Promise.resolve();
    }

    warnUnavailableOnStartup(_logger: Logger): void {
        // This module is always available; this method will never be called.
    }
}

export const diskUsageModule = new DiskUsageModule();
