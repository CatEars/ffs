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

async function getPages(): Promise<Page[]> {
    if (cachedPages === null) {
        cachedPages = await collectAllPages();
    }
    return cachedPages;
}

function createGatedRouter(router: Router, isActive: () => boolean): Router {
    const gate = async (ctx: Context, next: Next) => {
        if (!isActive()) {
            ctx.response.status = HTTP_404_NOT_FOUND;
            return;
        }
        await next();
    };
    const routeMethods = new Set([
        'get',
        'post',
        'put',
        'delete',
        'patch',
        'head',
        'options',
        'all',
    ]);
    return new Proxy(router, {
        get(target, prop) {
            if (typeof prop === 'string' && routeMethods.has(prop)) {
                return (path: string, ...handlers: unknown[]) => {
                    return (target as Record<string, (...args: unknown[]) => unknown>)[prop](
                        path,
                        gate,
                        ...handlers,
                    );
                };
            }
            const value = (target as Record<string | symbol, unknown>)[prop];
            return typeof value === 'function'
                ? (value as (...args: unknown[]) => unknown).bind(target)
                : value;
        },
    }) as unknown as Router;
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

export async function registerPluginPagesOnRouter(
    router: Router,
    isActive: () => boolean,
): Promise<void> {
    const allPages = await getPages();
    const pluginPages = allPages.filter((x) => x.type === 'Plugin') as PluginPage[];
    try {
        await registerPluginPages(pluginPages, router, isActive);
    } catch {
        logger.debug('Unable to register plugin pages');
    }
}

function registerStaticJsRoutes(pages: StaticJsPage[], router: Router) {
    for (const page of pages) {
        logger.info('Registering static JS page at', page.webPath);
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
    isActive: () => boolean,
) {
    const gatedRouter = createGatedRouter(router, isActive);
    const navbarLinks: NavbarLink[] = [];
    for (const page of pluginPages) {
        if (!page.enabled) {
            logger.info('Plugin', page.displayName, 'was disabled, will not register it');
            continue;
        }
        logger.info('Registering routes from', page.displayName);
        await page.register({ router: gatedRouter, navbarLinks });
    }
    await writeNavbarExtensions(navbarLinks);
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
