import { Router } from "@oak/oak/router";
import { apiProtect } from "../security/api-protect.ts";
import { getStoreRoot } from "../config.ts";

export function registerFileRoutes(router: Router) {
  router.get("/api/file", apiProtect, async (ctx) => {
    const path = ctx.request.url.searchParams.get("path");
    if (!path) {
      ctx.response.status = 404;
      return;
    }

    await ctx.send({
      path,
      root: getStoreRoot(),
    });
  });
}
