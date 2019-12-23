global.logger = require("./common/logger");
//global.logger = require("./common/logger-winston");

var index = parseInt(process.argv[process.argv.length - 1]);
logger.setupLog("LoginServer_" + index);
const path = require("path");
let log = logger.getLogger("start");

global.network = require("./login-server/network");
global.userMgr = require("./login-server/usermgr");
global.dbMgr = require("./login-server/dbmgr");
global.loginMgr = require("./login-server/loginmgr");
global.chatMgr = require("./login-server/chatmgr");
global.stringFilter = require("./common/stringfilter");

const Server = require("./common/server");
const Config = require("./config");

class LoginServer extends Server {
    constructor() {
        super();
    }

    init(callback) {
        dbMgr.init()
            .then(() => {
                const fullpath = path.join(process.cwd(), "./data/list.txt");
                stringFilter.loadFilterWords(fullpath, () => {
                    log.info("list.txt load finish...");
                    var _serverId = parseInt(process.argv[process.argv.length - 1]);
                    network.init(Config.loginHost, Config.loginPort + _serverId);
                    network.setLoginID(_serverId);
                    userMgr.init();
                    loginMgr.init();
                    chatMgr.init();
                    callback();
                });
            });
    }

    startup() {
        this.init(() => {
            super.startup();
            network.startup();
            log.info('LoginServer startup...');
        });
    }
}

const loginServer = new LoginServer();
loginServer.startup();