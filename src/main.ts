import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { registerAllFileListing } from "./file-listing/index.ts";
import { setConfig, testApiKey, unsecure, validateConfig } from "./config.ts";
import { registerAllLogonRoutes } from "./logon/index.ts";

setConfig({
  storeRoot: ".",
  apiKey: testApiKey,
});
validateConfig();

if (Deno.env.get("FFS_ABANDON_SECURITY") === "true") {
  unsecure();
}

const app = new Application();
const router = new Router();

registerAllFileListing(router);
registerAllLogonRoutes(router);

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8080 });
