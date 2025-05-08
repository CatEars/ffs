import { Router } from "@oak/oak/router";
import { Application } from "@oak/oak/application";

export function registerAllWebsiteRoutes(router: Router) {
  router.get("/", (ctx) => {
    ctx.response.redirect("/app");
  });
}

export function serveWebsiteMiddleware(application: Application) {
  application.use(async (ctx, next) => {
    if (!ctx.request.url.pathname.startsWith("/app")) {
      return next();
    }

    const path = ctx.request.url.pathname;
    let updatedPath = path.replace(/^\/app/g, "");

    if (!updatedPath.startsWith("/")) {
      updatedPath = "/" + updatedPath;
    }

    await ctx.send({
      index: "index.html",
      root: "./src/website/app",
      path: updatedPath,
    });
  });
}
