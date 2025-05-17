import { Eta } from "jsr:@eta-dev/eta";
import { Router } from "@oak/oak/router";
import { collectAllPages, PlainPage, PluginPage } from "./collect-all-pages.ts";
import { Context } from "@oak/oak/context";
import { devModeEnabled, viewPath } from "../config.ts";
import { Next } from "@oak/oak/middleware";
import { HTTP_404_NOT_FOUND } from "../utils/http-codes.ts";
import { logger } from "../logging/logger.ts";
import { baseMiddlewares } from "../base-middlewares.ts";
import { registerStaticRoutes } from "./static-files.ts";

export async function registerAllWebsiteRoutes(router: Router) {
  const allPages = await collectAllPages();
  const plainPages = allPages.filter((x) => x.type === "Plain") as PlainPage[];
  const pluginPages = allPages.filter((x) =>
    x.type === "Plugin"
  ) as PluginPage[];
  registerPlainPages(plainPages, router);
  await registerPluginPages(pluginPages, router);
  await registerStaticRoutes(router);
}

async function registerPluginPages(
  pluginPages: PluginPage[],
  router: Router,
) {
  for (const page of pluginPages) {
    logger.info("Registering routes from", page.displayName);
    await page.register(router);
  }
}

function passAlongMiddleware(_ctx: Context, next: Next) {
  return next();
}

function registerPlainPages(
  plainPages: PlainPage[],
  router: Router,
) {
  const longestWebPath = getLongestWebPath(plainPages);
  const longestPropPath = getLongestPropPath(plainPages);
  for (const page of plainPages) {
    logger.info(
      "Registering",
      getPageDescription(page, longestWebPath, longestPropPath),
    );
    let staticData = {};
    if (page.getStaticData) {
      staticData = page.getStaticData();
    }
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
    if (page.getDynamicData) {
      const dynamicDataGetter = page.getDynamicData;

      router.get(
        page.webPath,
        baseMiddlewares(),
        compoundMiddleware,
        async (ctx) => {
          const dynamicData = await dynamicDataGetter(ctx);
          respondWithData(ctx, page, { ...staticData, ...dynamicData });
        },
      );
    } else {
      router.get(page.webPath, baseMiddlewares(), compoundMiddleware, (ctx) => {
        respondWithData(ctx, page, staticData);
      });
    }
  }
}

function getLongestPropPath(allPages: PlainPage[]) {
  return allPages.map((x) => getProps(x).length)
    .reduce((p, c) => p > c ? p : c);
}

function getLongestWebPath(allPages: PlainPage[]) {
  return allPages.map((x) => x.webPath.length)
    .reduce((p, c) => p > c ? p : c);
}

const eta = new Eta({
  views: viewPath,
  cache: !devModeEnabled,
});

function respondWithData(ctx: Context, page: PlainPage, data: object) {
  const rendered = eta.render(page.etaPath, data);
  const response = new Response(rendered, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
  ctx.response.with(response);
}

function getProps(page: PlainPage) {
  const props = [];
  if (page.getStaticData) {
    props.push("Static");
  }
  if (page.getDynamicData) {
    props.push("Dynamic");
  }
  if (props.length === 0) {
    props.push("Plain");
  }
  return props.join("+");
}

function getPageDescription(
  page: PlainPage,
  longestWebPath: number,
  longestPropLength: number,
): string {
  const webPath = page.webPath.padEnd(longestWebPath);
  const props = getProps(page).padEnd(longestPropLength);
  return `${webPath}   [${props}] --> ${page.etaPath}`;
}
