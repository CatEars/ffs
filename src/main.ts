import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";

const app = new Application();
const router = new Router();
router.get("/", (ctx) => {
  ctx.response.body = "hello world!";
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen({ port: 8080 });
