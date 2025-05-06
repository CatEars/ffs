import { Router } from "@oak/oak/router";
import { registerBasicAuthRoutes } from "./basic-auth.ts";

export function registerAllLogonRoutes(router: Router) {
  registerBasicAuthRoutes(router);
}
