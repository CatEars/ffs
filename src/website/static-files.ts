import { Router } from '@oak/oak';
import { logger } from '../logging/logger.ts';
import { baseMiddlewares } from '../base-middlewares.ts';
import { FileTreeWalker } from '../files/file-tree-walker.ts';
import { devModeEnabled } from '../config.ts';

const anHour = 1_000 * 60 * 60 * 1;
const maxage = devModeEnabled ? 0 : anHour;

export async function registerStaticRoutes(router: Router) {
    await registerUnder(router, './src/website/static', '/static');
    // Imported javascript libraries are put under `vendor` folder
    await registerUnder(
        router,
        './src/website/views/components/vendor',
        '/components/vendor',
    );

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

export async function generatePreloadHtmlTemplate() {
    const staticJsWalker = new FileTreeWalker('./src/website/views/components');
    staticJsWalker.filter((x) => x.name.endsWith('.js'));
    const paths = await staticJsWalker.collectAll();
    const links = paths.map((x) =>
        `<link rel="modulepreload" href="/components${x.parent}${x.name}" />`
    ).sort();
    const generatedHtml =
        '<!-- This file is auto-generated. It can be commited to source control, but do not modify! -->\n' +
        links.join('\n');
    await Deno.writeFile(
        './src/website/views/templates/preload.html',
        new TextEncoder().encode(generatedHtml),
    );
}
