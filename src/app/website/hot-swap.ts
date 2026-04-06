import { Router } from '@oak/oak/router';
import { viewPath } from '../config.ts';
import { logger } from '../logging/loggers.ts';
import { clearAllRenderCache } from './templating.ts';
import { syncNewRoutesWithRouter } from './index.ts';

const DEBOUNCE_MS = 200;

export function startHotSwap(router: Router): void {
    watchForChanges(router).catch((err) => {
        logger.error('Hot-swap file watcher stopped unexpectedly:', err);
    });
}

async function watchForChanges(router: Router): Promise<void> {
    const watcher = Deno.watchFs(viewPath, { recursive: true });

    let debounceTimer: number | null = null;
    const changedPaths = new Set<string>();

    for await (const event of watcher) {
        for (const path of event.paths) {
            changedPaths.add(path);
        }

        if (debounceTimer !== null) {
            clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
            const paths = [...changedPaths];
            changedPaths.clear();
            debounceTimer = null;
            handleChanges(router, paths).catch((err) => {
                logger.error('Error during hot-swap:', err);
            });
        }, DEBOUNCE_MS);
    }
}

async function handleChanges(router: Router, paths: string[]): Promise<void> {
    logger.info(`Hot-swap: detected ${paths.length} change(s), refreshing pages and plugins`);
    clearAllRenderCache();
    await syncNewRoutesWithRouter(router);
}
