import { Context } from '@oak/oak/context';
import { Next } from '@oak/oak/middleware';
import { Router } from '@oak/oak/router';
import { resolve } from '@std/path/resolve';
import { HTTP_404_NOT_FOUND } from '../../lib/http/http-codes.ts';
import { baseMiddlewares } from '../base-middlewares.ts';
import { viewPath } from '../config.ts';
import { logger } from '../logging/loggers.ts';
import {
    collectAllPages,
    NavbarLink,
    Page,
    PlainPage,
    PluginPage,
    StaticJsPage,
} from './collect-all-pages.ts';
import { registerStaticRoutes } from './static-files.ts';
import { loadHtml } from './templating.ts';

let cachedPages: Page[] | null = null;

const registeredWebPaths = new Set<string>();
const registeredPluginNames = new Set<string>();
const registeredPluginNavbarLinks = new Map<string, NavbarLink[]>();

async function getPages(): Promise<Page[]> {
    if (cachedPages === null) {
        cachedPages = await collectAllPages();
    }
    return cachedPages;
}

export async function registerAllWebsiteRoutes(router: Router) {
    const allPages = await getPages();
    const plainPages = allPages.filter((x) => x.type === 'Plain') as PlainPage[];
    const jsPages = allPages.filter((x) => x.type === 'Js') as StaticJsPage[];
    registerPlainPages(plainPages, router);
    await writeNavbarExtensions([]);

    await registerStaticRoutes(router);
    registerStaticJsRoutes(jsPages, router);
}

export async function registerPluginPagesOnRouter(router: Router): Promise<void> {
    const allPages = await getPages();
    const pluginPages = allPages.filter((x) => x.type === 'Plugin') as PluginPage[];
    try {
        await registerPluginPages(pluginPages, router);
    } catch {
        logger.debug('Unable to register plugin pages');
    }
}

export async function syncNewRoutesWithRouter(router: Router): Promise<void> {
    cachedPages = null;
    const allPages = await getPages();
    const plainPages = allPages.filter((x) => x.type === 'Plain') as PlainPage[];
    const pluginPages = allPages.filter((x) => x.type === 'Plugin') as PluginPage[];
    const jsPages = allPages.filter((x) => x.type === 'Js') as StaticJsPage[];

    const newPlainPages = plainPages.filter((p) => !registeredWebPaths.has(p.webPath));
    const newJsPages = jsPages.filter((p) => !registeredWebPaths.has(p.webPath));
    const newPluginPages = pluginPages.filter((p) => !registeredPluginNames.has(p.displayName));

    if (newPlainPages.length > 0) {
        registerPlainPages(newPlainPages, router);
    }
    if (newJsPages.length > 0) {
        registerStaticJsRoutes(newJsPages, router);
    }
    if (newPluginPages.length > 0) {
        try {
            await registerPluginPages(newPluginPages, router);
        } catch {
            logger.debug('Unable to register new plugin pages during hot-swap');
        }
    }
}

function registerStaticJsRoutes(pages: StaticJsPage[], router: Router) {
    for (const page of pages) {
        logger.info('Registering static JS page at', page.webPath);
        registeredWebPaths.add(page.webPath);
        router.get(page.webPath, async (ctx) => {
            await ctx.send({
                root: viewPath,
                path: page.filePath,
            });
        });
    }
}

async function registerPluginPages(
    pluginPages: PluginPage[],
    router: Router,
) {
    let anyRegistered = false;
    for (const page of pluginPages) {
        if (registeredPluginNames.has(page.displayName)) {
            continue;
        }
        if (!page.enabled) {
            logger.info('Plugin', page.displayName, 'was disabled, will not register it');
            continue;
        }
        logger.info('Registering routes from', page.displayName);
        const navbarLinks: NavbarLink[] = [];
        await page.register({ router, navbarLinks });
        registeredPluginNames.add(page.displayName);
        registeredPluginNavbarLinks.set(page.displayName, navbarLinks);
        anyRegistered = true;
    }
    if (anyRegistered) {
        const allNavbarLinks = [...registeredPluginNavbarLinks.values()].flat();
        await writeNavbarExtensions(allNavbarLinks);
    }
}

async function writeNavbarExtensions(navbarLinks: NavbarLink[]) {
    const links = navbarLinks.map((link) =>
        `<header-tab href="${link.webPath}">${link.displayText}</header-tab>`
    );
    await Deno.writeTextFile(
        resolve(viewPath, '../templates/header/links-added-by-plugins.html'),
        '<!-- Below is auto-generated, do not touch! -->\n' +
            links.join('\n'),
    );
}

function passAlongMiddleware(_ctx: Context, next: Next) {
    return next();
}

function registerPlainPages(
    plainPages: PlainPage[],
    router: Router,
) {
    if (plainPages.length === 0) {
        return;
    }
    const longestWebPath = getLongestWebPath(plainPages);
    for (const page of plainPages) {
        logger.info(
            'Registering',
            getPageDescription(page, longestWebPath),
        );
        registeredWebPaths.add(page.webPath);
        const middlewares = page.middlewares;
        if (middlewares.length === 0) {
            middlewares.push(passAlongMiddleware);
        }

        const compoundMiddleware = async (ctx: Context, next: Next) => {
            let nextCalled = false;
            const wrappedNext = () => {
                nextCalled = true;
                return next();
            };
            for (const mid of page.middlewares) {
                await mid(ctx, wrappedNext);
                if (nextCalled || ctx.response.status != HTTP_404_NOT_FOUND) {
                    return;
                }
            }
        };
        router.get(page.webPath, baseMiddlewares(), compoundMiddleware, (ctx) => {
            respondWithData(ctx, page);
        });
    }
}

function getLongestWebPath(allPages: PlainPage[]) {
    return allPages.map((x) => x.webPath.length)
        .reduce((p, c) => p > c ? p : c);
}

function respondWithData(ctx: Context, page: PlainPage) {
    const actualPath = resolve(viewPath, '.' + page.filePath);
    const htmlTemplate = loadHtml(actualPath);
    const rendered = htmlTemplate.render();
    const response = new Response(rendered, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
        },
    });
    ctx.response.with(response);
}

function getPageDescription(
    page: PlainPage,
    longestWebPath: number,
): string {
    const webPath = page.webPath.padEnd(longestWebPath);
    return `${webPath}   [Plain] --> ${page.filePath}`;
}
