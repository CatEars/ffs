import { Router } from "jsr:@oak/oak/router";
import { fileExistsUnder } from "../utils/file-exists-under.ts";
import { getStoreRoot } from "../config.ts";
import { HTTP_404_NOT_FOUND } from "../utils/http-codes.ts";
import { apiProtect } from "../security/api-protect.ts";

type ApiFile = Deno.DirEntry & {
  date: Date;
};

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
      const files = Deno.readDirSync(fileOrDirectory).toArray();
      const results: ApiFile[] = [];
      for (const result of files) {
        const fileStat = Deno.lstatSync(`${fileOrDirectory}/${result.name}`);
        const date = fileStat.ctime || fileStat.mtime || new Date(0);
        results.push({ ...result, date });
      }
      ctx.response.body = results;
    } else {
      ctx.response.status = HTTP_404_NOT_FOUND;
    }
  });
}
