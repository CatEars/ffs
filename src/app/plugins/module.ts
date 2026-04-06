import { Router } from '@oak/oak/router';
import { Logger } from '../../lib/logger/logger.ts';
import { OptionalModule } from '../../lib/optional-module/optional-module.ts';
import { registerPluginPagesOnRouter } from '../website/index.ts';

class PluginsModule implements OptionalModule {
    private activated: boolean = false;
    private routesRegistered: boolean = false;
    private router: Router | null = null;

    public readonly name: string = 'Disk Plugins';
    public readonly description: string =
        'Loads and registers plugin pages from disk, including their routes and navbar links.';

    setRouter(router: Router): void {
        this.router = router;
    }

    isAvailable(): Promise<boolean> {
        return Promise.resolve(true);
    }

    init(): Promise<void> {
        return Promise.resolve();
    }

    isActivated(): boolean {
        return this.activated;
    }

    async activate(): Promise<void> {
        // Routes cannot be removed from Oak's router once registered, so we
        // only register them on the first activation. Subsequent activate()
        // calls (e.g. after a deactivate/activate cycle) only update the flag.
        if (!this.routesRegistered && this.router !== null) {
            await registerPluginPagesOnRouter(this.router);
            this.routesRegistered = true;
        }
        this.activated = true;
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
