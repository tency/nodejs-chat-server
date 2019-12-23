global.logger = require("./common/logger");
logger.setupLog("WebServer");

let log = logger.getLogger("start");

global.network = require("./web-server/network");
global.httpService = require("./common/http-service");

const Config = require("./config");
const Server = require("./common/server");

class WebServer extends Server {
    constructor() {
        super();
    }

    init(callback) {
        network.init();
        callback();
    }

    startup() {
        this.init(() => {
            super.startup();
            network.startup();

            httpService.startup("web", Config.webPort, Config.webHost, () => {
                // 消息处理
            }, (callback) => {
                // 退出处理
                callback && callback();
            });

            log.info('WebServer startup...');
        });
    }
}

const webServer = new WebServer();
webServer.startup();