import { Router } from "jsr:@oak/oak/router";
import { fileExistsUnder } from "../utils/file-exists-under.ts";

export function register(router: Router) {
  router.get("/directory", (ctx) => {
    const pathToCheck = ctx.request.url.searchParams.get("path");
    if (!pathToCheck) {
      ctx.response.status = 404;
      return;
    }

    const root = ".";
    const fileOrDirectory = fileExistsUnder(pathToCheck, root);
    if (fileOrDirectory) {
      ctx.response.body = Deno.readDirSync(fileOrDirectory).toArray();
    } else {
      ctx.response.status = 404;
    }
  });
}
