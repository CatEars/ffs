import { Router } from "jsr:@oak/oak/router";
import { getStoreRoot } from "../config.ts";
import { HTTP_404_NOT_FOUND } from "../utils/http-codes.ts";
import { apiProtect } from "../security/api-protect.ts";
import { baseMiddlewares } from "../base-middlewares.ts";
import { FileTree } from "../files/file-tree.ts";

type ApiFile = Deno.DirEntry & {
  date: Date;
};

export function registerDirectoryRoutes(router: Router) {
  const fileTree = new FileTree(getStoreRoot());

  router.get("/api/directory", baseMiddlewares(), apiProtect, (ctx) => {
    const pathToCheck = ctx.request.url.searchParams.get("path");
    if (!pathToCheck) {
      ctx.response.status = HTTP_404_NOT_FOUND;
      return;
    }

    const listing = fileTree.listDirectory(pathToCheck);
    if (listing.type === "none") {
      ctx.response.status = HTTP_404_NOT_FOUND;
      return;
    }

    const results: ApiFile[] = [];
    for (const result of listing.files) {
      const fileStat = fileTree.stat(listing, result.name);
      if (fileStat.type === "invalid") {
        continue;
      }
      const date = fileStat.info.ctime || fileStat.info.mtime || new Date(0);
      results.push({ ...result, date });
    }

    ctx.response.body = results;
  });
}
