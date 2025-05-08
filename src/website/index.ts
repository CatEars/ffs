import { Router } from "@oak/oak/router";

export function registerAllWebsiteRoutes(router: Router) {
  router.get("/", (ctx) => {
    ctx.response.redirect("/app");
  });
  router.get("/app", async (ctx) => {
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
