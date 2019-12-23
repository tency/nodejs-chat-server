global.logger = require("./common/logger");
logger.setupLog("WebServer");

let log = logger.getLogger("start");

global.network = require("./web-server/network");
global.httpService = require("./common/http-service");

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
            httpService.startup();
            log.info('WebServer startup...');
        });
    }
}

const webServer = new WebServer();
webServer.startup();