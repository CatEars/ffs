import { Router } from "@oak/oak";
import { logger } from "../logging/logger.ts";
import { baseMiddlewares } from "../base-middlewares.ts";
import { FileTreeWalker } from "../files/file-tree-walker.ts";

export async function registerStaticRoutes(router: Router) {
  const staticTreeWalker = new FileTreeWalker("./src/website/static");
  staticTreeWalker.filter((x) => x.name !== ".gitkeep");
  for await (const entry of staticTreeWalker.walk()) {
    const relPath = entry.parent.slice(1) + entry.name;
    const webPath = `/static/${relPath}`;
    logger.info("Registering static file", webPath);
    router.get(webPath, baseMiddlewares(), async (ctx) => {
      await ctx.send({
        root: "./src/website/static/",
        path: relPath,
      });
    });
  }

  // Special case: favicon
  logger.info("Registering /favicon.ico");
  router.get("/favicon.ico", baseMiddlewares(), async (ctx) => {
    await ctx.send({
      root: "./src/website/static/",
      path: "favicon.ico",
    });
  });
}
