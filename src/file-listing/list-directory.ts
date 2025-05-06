import { Router } from "jsr:@oak/oak/router";
import { fileExistsUnder } from "../utils/file-exists-under.ts";
import { getStoreRoot } from "../config.ts";
import { HTTP_404_NOT_FOUND } from "../utils/http-codes.ts";
import { apiProtect } from "../security/api-protect.ts";

export function registerDirectoryRoutes(router: Router) {
  router.get("/api/directory", apiProtect, (ctx) => {
    const pathToCheck = ctx.request.url.searchParams.get("path");
    if (!pathToCheck) {
      ctx.response.status = HTTP_404_NOT_FOUND;
      return;
    }

    const root = getStoreRoot();
    const fileOrDirectory = fileExistsUnder(pathToCheck, root);
    if (fileOrDirectory) {
      ctx.response.body = Deno.readDirSync(fileOrDirectory).toArray();
    } else {
      ctx.response.status = HTTP_404_NOT_FOUND;
    }
  });
}
