import { Router } from "@oak/oak/router";
import { registerDirectoryRoutes } from "./list-directory.ts";

export function registerAllFileListing(router: Router) {
  registerDirectoryRoutes(router);
}
