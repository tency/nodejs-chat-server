const Koa = require("koa");
const log = logger.getLogger("HttpService");

class HttpService {
    constructor() {
        this.app = new Koa();
    }

    startup() {
        this.app.use(async ctx => {
            ctx.body = "Hello World";
        });

        this.app.listen(8080);
        log.info("server listen on port 8080");
    }
}

let httpService = global.httpService || new HttpService();
module.exports = httpService;