import { Logger } from '../../lib/logger/logger.ts';
import { OptionalModule } from '../../lib/optional-module/optional-module.ts';
import { areThumbnailsAvailable, startThumbnailBackgroundProcess } from './index.ts';

class ThumbnailsModule implements OptionalModule {
    private activated: boolean = false;
    public readonly name: string = 'Automatic Thumbnail Generation';

    isAvailable(): Promise<boolean> {
        return Promise.resolve(areThumbnailsAvailable());
    }

    init(): Promise<void> {
        // Always start the background process,
        // By deactivating we simply stop producing and returning thumbnails
        startThumbnailBackgroundProcess();
        return Promise.resolve();
    }

    isActivated(): boolean {
        return this.activated;
    }

    activate(): Promise<void> {
        this.activated = true;
        return Promise.resolve();
    }

    deactivate(): Promise<void> {
        this.activated = false;
        return Promise.resolve();
    }

    warnUnavailableOnStartup(logger: Logger): void {
        logger.warn('ffmpeg and/or image magick was not installed so will not activate', this.name);
    }
}

export const thumbnailsModule = new ThumbnailsModule();
