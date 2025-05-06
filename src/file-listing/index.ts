import { Router } from "@oak/oak/router";
import { registerDirectoryRoutes } from "./list-directory.ts";
import { registerFileRoutes } from "./get-file.ts";

export function registerAllFileListing(router: Router) {
  registerDirectoryRoutes(router);
  registerFileRoutes(router);
}
