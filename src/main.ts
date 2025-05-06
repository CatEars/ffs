import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { register } from "./file-listing/list-directory.ts";

const app = new Application();
const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = "hello world!";
});
register(router);

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 8080 });
