import Koa from "koa";
import bodyParser from "koa-bodyparser";
import config from "./config.js";
import devices from "./devices.js";
import loadCode from "./loadCode.js";
import handleInterface from "./handleInterface.js";

(async () => {
  const files = devices("./devices");
  const deviceSrc = await loadCode(files);
  handleInterface(files);

  const app = new Koa();
  app.use(bodyParser());

  app.use(async ctx => {
    for (const file of files) {
      if (file == ctx.path) {
        console.log(`Device found with: ${file}`);
        const body = ctx.request.body;
        deviceSrc[file].default(body.state, body.params);
      }
    }
    ctx.body = 'Device Request OK';
  });

  app.listen(config().port);
})()