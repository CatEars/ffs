import { Router } from "@oak/oak";
import { join } from "@std/path";
import { move } from "@std/fs";
import { logger } from "../logging/logger.ts";

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

    for (const { path, fileName } of filesToMove) {
      try {
        const from = join(path, fileName);
        const to = join(destination.toString(), fileName);
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
