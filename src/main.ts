import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { registerAllFileListing } from "./file-listing/index.ts";
import { setConfig, unsecure, validateConfig } from "./config.ts";
import { registerAllLogonRoutes } from "./logon/index.ts";
import { registerAllWebsiteRoutes } from "./website/index.ts";

setConfig({
  storeRoot: ".",
  usersFilePath: "data/users-file.json",
});
validateConfig();

if (Deno.env.get("FFS_ABANDON_SECURITY") === "true") {
  unsecure();
}

const app = new Application();
const router = new Router();

registerAllFileListing(router);
registerAllLogonRoutes(router);
registerAllWebsiteRoutes(router);

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Starting server on http://localhost:8080");
app.listen({ port: 8080 });
