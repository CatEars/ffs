import { Router } from '@oak/oak';
import { logger } from '../logging/logger.ts';
import { baseMiddlewares } from '../base-middlewares.ts';
import { FileTreeWalker } from '../files/file-tree-walker.ts';
import { devModeEnabled } from '../config.ts';

const anHour = 1_000 * 60 * 60 * 1;
const maxage = devModeEnabled ? 0 : anHour;

export async function registerStaticRoutes(router: Router) {
    await registerUnder(router, './src/website/static', '/static');

    // Special case: favicon
    logger.info('Registering /favicon.ico');
    router.get('/favicon.ico', baseMiddlewares(), async (ctx) => {
        await ctx.send({
            root: './src/website/static/',
            path: 'favicon.ico',
            maxage,
        });
    });
}

async function registerUnder(router: Router, root: string, webRoot: string) {
    const staticTreeWalker = new FileTreeWalker(root);
    staticTreeWalker.filter((x) => !x.name.startsWith('.git'));
    for await (const entry of staticTreeWalker.walk()) {
        const relPath = entry.parent.slice(1) + entry.name;
        const webPath = `${webRoot}/${relPath}`;
        logger.info('Registering static file', webPath);
        router.get(webPath, baseMiddlewares(), async (ctx) => {
            await ctx.send({
                root: `${root}/`,
                path: relPath,
                maxage,
            });
        });
    }
}
