import { Eta } from "jsr:@eta-dev/eta";
import { Router } from "@oak/oak/router";
import { collectAllPages, Page } from "./collect-all-pages.ts";
import { Context } from "@oak/oak/context";
import { viewPath } from "../config.ts";

const eta = new Eta({ views: viewPath, cache: true });

export async function registerAllWebsiteRoutes(router: Router) {
  const allPages = await collectAllPages();
  const longestWebPath = getLongestWebPath(allPages);
  const longestPropPath = getLongestPropPath(allPages);
  for (const page of allPages) {
    console.log(
      "Registering",
      getPageDescription(page, longestWebPath, longestPropPath),
    );
    let staticData = {};
    if (page.getStaticData) {
      staticData = page.getStaticData();
    }

    if (page.getDynamicData) {
      const dynamicDataGetter = page.getDynamicData;

      router.get(page.webPath, async (ctx) => {
        const dynamicData = await dynamicDataGetter(ctx);
        respondWithData(ctx, page, { ...staticData, ...dynamicData });
      });
    } else {
      router.get(page.webPath, (ctx) => {
        respondWithData(ctx, page, staticData);
      });
    }
  }
}

function getLongestPropPath(allPages: Page[]) {
  return allPages.map((x) => getProps(x).length)
    .reduce((p, c) => p > c ? p : c);
}

function getLongestWebPath(allPages: Page[]) {
  return allPages.map((x) => x.webPath.length)
    .reduce((p, c) => p > c ? p : c);
}

function respondWithData(ctx: Context, page: Page, data: object) {
  const rendered = eta.render(page.etaPath, data);
  const response = new Response(rendered, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
  ctx.response.with(response);
}

function getProps(page: Page) {
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
  page: Page,
  longestWebPath: number,
  longestPropLength: number,
): string {
  const webPath = page.webPath.padEnd(longestWebPath);
  const props = getProps(page).padEnd(longestPropLength);
  return `${webPath}   [${props}] --> ${page.etaPath}`;
}
