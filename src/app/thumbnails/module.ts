import { Logger } from '../../lib/logger/logger.ts';
import { OptionalModule } from '../../lib/optional-module/optional-module.ts';
import {
    activateThumbnailWorker,
    areThumbnailsAvailable,
    deactivateThumbnailWorker,
    startThumbnailBackgroundProcess,
} from './worker/index.ts';

class ThumbnailsModule implements OptionalModule {
    private activated: boolean = false;
    public readonly name: string = 'Automatic Thumbnail Generation';

    isAvailable(): Promise<boolean> {
        return areThumbnailsAvailable();
    }

    async init(): Promise<void> {
        // Always start the background process,
        // By deactivating we simply stop producing and returning thumbnails
        await startThumbnailBackgroundProcess();
    }

    isActivated(): boolean {
        return this.activated;
    }

    activate(): Promise<void> {
        activateThumbnailWorker();
        this.activated = true;
        return Promise.resolve();
    }

    deactivate(): Promise<void> {
        deactivateThumbnailWorker();
        this.activated = false;
        return Promise.resolve();
    }

    warnUnavailableOnStartup(logger: Logger): void {
        logger.warn('ffmpeg and/or image magick was not installed so will not activate', this.name);
    }
}

export const thumbnailsModule = new ThumbnailsModule();
