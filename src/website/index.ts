import { Eta } from "https://deno.land/x/eta@v3.0.3/src/index.ts";
import { Router } from "@oak/oak/router";
import {
  collectAllPages,
  CompileTimeDynamicHtml,
  PlainHtml,
  RunTimeDynamicHtml,
} from "./collect-all-pages.ts";

const viewPath = Deno.cwd() + "/src/website/views/";
const eta = new Eta({ views: viewPath, cache: true });

export function registerAllWebsiteRoutes(router: Router) {
  const allPages = collectAllPages();
  for (const page of allPages) {
    for (const route of page.webPaths) {
      if (page.type === "PlainHtml") {
        registerPlainHtmlPage(router, route, page);
      } else if (page.type === "CompileTimeDynamicHtml") {
        registerCompileTimeDynamicHtml(router, route, page);
      } else if (page.type === "RunTimeDynamicHtml") {
        registerRuntimeDynamicHtml(router, route, page);
      }
    }
  }
}

function registerPlainHtmlPage(router: Router, route: string, page: PlainHtml) {
  router.get(route, (ctx) => {
    const rendered = eta.render(page.etaPath, {});
    const response = new Response(rendered, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
    ctx.response.with(response);
  });
}

function registerCompileTimeDynamicHtml(
  router: Router,
  route: string,
  page: CompileTimeDynamicHtml,
) {
  const compileTimeData = page.getTemplateData();
  router.get(route, (ctx) => {
    const rendered = eta.render(page.etaPath, compileTimeData);
    const response = new Response(rendered, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
    ctx.response.with(response);
  });
}

function registerRuntimeDynamicHtml(
  router: Router,
  route: string,
  page: RunTimeDynamicHtml,
) {
  router.get(route, async (ctx) => {
    const runtimeData = await page.getTemplateData(ctx);
    const rendered = eta.render(page.etaPath, runtimeData);
    const response = new Response(rendered, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
    ctx.response.with(response);
  });
}
