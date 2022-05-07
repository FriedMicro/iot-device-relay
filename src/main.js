import Koa from "koa";
import config from "./config.js";
import devices from "./devices.js";
import loadCode from "./loadCode.js";

(async () => {
  const files = devices("./devices");
  const deviceSrc = await loadCode(files);
  console.log(files);
  
  const app = new Koa();
  
  app.use(async ctx => {
    for(const file of files){
      if(file == ctx.path){
        console.log(`Device found with: ${file}`);
        deviceSrc[file].default();
      }
    }
    ctx.body = 'Device Request OK';
  });
  
  app.listen(config().port);
})()