import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { registerAllFileListing } from "./file-listing/index.ts";
import { setConfig, testApiKey, validateConfig } from "./config.ts";

setConfig({
  storeRoot: ".",
  apiKey: testApiKey,
});
validateConfig();

const app = new Application();
const router = new Router();

registerAllFileListing(router);

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8080 });
