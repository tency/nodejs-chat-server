global.logger = require("./common/logger");
logger.setupLog("WebServer");

const log = logger.getLogger("start");

global.network = require("./web-server/network");
global.httpService = require("./common/http-service");
global.logicHandler = require("./web-server/logichandler");

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

            httpService.startup("web", Config.webPort, Config.webHost, (req, res, callback) => {
                logicHandler.handleMessage(req, res, () => {
                    callback && callback();
                });
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