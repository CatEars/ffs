import { Router } from "@oak/oak";
import { logger } from "../logging/logger.ts";
import { baseMiddlewares } from "../base-middlewares.ts";
import { walk } from "@std/fs/walk";
import { relative } from "@std/path/relative";

export async function registerStaticRoutes(router: Router) {
  for await (
    const staticFile of walk("./src/website/static", {
      includeDirs: false,
      includeFiles: true,
      includeSymlinks: false,
    })
  ) {
    if (staticFile.name === ".gitkeep") {
      continue;
    }
    const relPath = relative("./src/website/static", staticFile.path);
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
