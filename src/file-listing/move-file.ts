import { Router } from "@oak/oak";
import { join } from "@std/path";
import { move } from "@std/fs";
import { logger } from "../logging/logger.ts";
import { getStoreRoot } from "../config.ts";
import { fileExistsUnder } from "../utils/file-exists-under.ts";
import { HTTP_400_BAD_REQUEST } from "../utils/http-codes.ts";

export function registerMoveFileRoute(router: Router) {
  router.post("/api/file/move", async (ctx) => {
    const formData = await ctx.request.body.formData();

    const filesToMoveRaw = formData.get("files-to-move");
    const destination = formData.get("destination");

    if (!filesToMoveRaw || !destination) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing files-to-move or destination" };
      return;
    }

    let filesToMove: Array<{ path: string; fileName: string }>;
    try {
      filesToMove = JSON.parse(filesToMoveRaw.toString());
      if (!Array.isArray(filesToMove)) throw new Error();
    } catch {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid files-to-move format" };
      return;
    }

    const root = getStoreRoot();
    for (const { path, fileName } of filesToMove) {
      try {
        const from = fileExistsUnder(join(root, path, fileName), root);
        const to = fileExistsUnder(
          join(root, destination.toString(), fileName),
          root,
        );
        if (!from || !to) {
          ctx.response.status = HTTP_400_BAD_REQUEST;
          return;
        }
        await move(from, to, { overwrite: false });
      } catch (err) {
        logger.warn(
          "Tried to move file",
          path,
          fileName,
          "to",
          destination.toString(),
          "but failed with",
          err,
        );
      }
    }

    ctx.response.redirect(
      ctx.request.headers.get("Referer") || "/file-manager/",
    );
  });
}
