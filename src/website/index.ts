import { Router } from "@oak/oak/router";
import {
  collectAllPages,
  NavbarLink,
  PlainPage,
  PluginPage,
  StaticJsPage,
} from "./collect-all-pages.ts";
import { Context } from "@oak/oak/context";
import { viewPath } from "../config.ts";
import { Next } from "@oak/oak/middleware";
import { HTTP_404_NOT_FOUND } from "../utils/http-codes.ts";
import { logger } from "../logging/logger.ts";
import { baseMiddlewares } from "../base-middlewares.ts";
import { registerStaticRoutes } from "./static-files.ts";
import { resolve } from "@std/path/resolve";
import { loadHtml } from "./templating.ts";

export async function registerAllWebsiteRoutes(router: Router) {
  const allPages = await collectAllPages();
  const plainPages = allPages.filter((x) => x.type === "Plain") as PlainPage[];
  const pluginPages = allPages.filter((x) =>
    x.type === "Plugin"
  ) as PluginPage[];
  const jsPages = allPages.filter((x) => x.type === "Js") as StaticJsPage[];
  registerPlainPages(plainPages, router);
  await registerPluginPages(pluginPages, router);
  await registerStaticRoutes(router);
  registerStaticJsRoutes(jsPages, router);
}

function registerStaticJsRoutes(pages: StaticJsPage[], router: Router) {
  for (const page of pages) {
    logger.info("Registering static JS page at", page.webPath);
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
  const navbarLinks: NavbarLink[] = [];
  for (const page of pluginPages) {
    if (!page.enabled) {
      logger.info("Plugin", page.displayName, "was disabled, will not register it")
      continue;
    }
    logger.info("Registering routes from", page.displayName);
    await page.register({
      router,
      navbarLinks,
    });
  }
  await writeNavbarExtensions(navbarLinks);
}

async function writeNavbarExtensions(navbarLinks: NavbarLink[]) {
  const links = navbarLinks.map((link) =>
    `<a href="${link.webPath}" class="nav-link">${link.displayText}</a>`
  );
  await Deno.writeTextFile(
    resolve(viewPath, "templates/header/links-added-by-plugins.html"),
    "<!-- Below is auto-generated, do not touch! -->\n" +
      links.join("\n"),
  );
}

function passAlongMiddleware(_ctx: Context, next: Next) {
  return next();
}

function registerPlainPages(
  plainPages: PlainPage[],
  router: Router,
) {
  const longestWebPath = getLongestWebPath(plainPages);
  for (const page of plainPages) {
    logger.info(
      "Registering",
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
  const actualPath = resolve(viewPath, "." + page.filePath);
  const htmlTemplate = loadHtml(actualPath);
  const rendered = htmlTemplate.render();
  const response = new Response(rendered, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
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
