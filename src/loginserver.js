global.logger = require("./common/logger");
logger.setupLog("LoginServer");

let log = logger.getLogger("start");

global.network = require("./login-server/network");
global.userMgr = require("./login-server/usermgr");

const Server = require("./common/server");
const Config = require("./config");

class LoginServer extends Server {
    constructor() {
        super();
    }

    init() {
        var _serverId = parseInt(process.argv[process.argv.length - 1]);
        network.init(Config.loginHost, Config.loginPort + _serverId);
        userMgr.init();
    }

    startup() {
        super.startup();
        this.init();
        network.startup();
        log.info('LoginServer startup...');
    }
}

const loginServer = new LoginServer();
loginServer.startup();