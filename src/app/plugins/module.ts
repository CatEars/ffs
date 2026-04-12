import { Logger } from '../../lib/logger/logger.ts';
import { OptionalModule } from '../../lib/optional-module/optional-module.ts';

class PluginsModule implements OptionalModule {
    private activated: boolean = false;

    public readonly name: string = 'Disk Plugins';
    public readonly description: string =
        'Loads and registers plugin pages from disk, including their routes and navbar links.';

    isAvailable(): Promise<boolean> {
        return Promise.resolve(true);
    }

    init(): Promise<void> {
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

    warnUnavailableOnStartup(_logger: Logger): void {
        // always available
    }
}

export const pluginsModule = new PluginsModule();
