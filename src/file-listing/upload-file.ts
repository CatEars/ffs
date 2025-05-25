import * as path from "jsr:@std/path";
import { Router } from "@oak/oak/router";
import { fileExistsUnder } from "../utils/file-exists-under.ts";
import { getStoreRoot } from "../config.ts";
import {
  HTTP_400_BAD_REQUEST,
  HTTP_403_FORBIDDEN,
} from "../utils/http-codes.ts";
import { baseMiddlewares } from "../base-middlewares.ts";
import { resolve } from "@std/path/resolve";

export function registerUploadFileRoute(router: Router) {
  router.post("/api/file/upload", baseMiddlewares(), async (ctx) => {
    const data = await ctx.request.body.formData();
    const directory = data.get("directory")?.toString() || getStoreRoot();
    const file = data.get("file");
    if (!(file instanceof File)) {
      ctx.response.status = HTTP_400_BAD_REQUEST;
      return;
    }
    const name = file.name;

    const root = getStoreRoot();
    const targetDirectory = resolve(root, directory);
    if (fileExistsUnder(targetDirectory, root)) {
      const filePath = resolveUploadFilename(targetDirectory, name);
      await Deno.writeFile(filePath, file.stream());
      ctx.response.redirect(
        ctx.request.headers.get("Referer") || "/file-manager/",
      );
    } else {
      ctx.response.status = HTTP_403_FORBIDDEN;
    }
  });
}

function resolveUploadFilename(directory: string, name: string): string {
  const extName = path.extname(name);
  let fileName = name;
  const filesInDir = (Deno.readDirSync(directory)).toArray();
  while (filesInDir.some((x) => x.name === fileName)) {
    fileName = fileName.substring(0, fileName.length - extName.length) +
      " Copy" + extName;
  }
  return path.resolve(directory, fileName);
}
