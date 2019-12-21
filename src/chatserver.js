global.logger = require("./common/logger");
logger.setupLog("chatServer");

let log = logger.getLogger("start");

global.network = require("./chat-server/network");
global.userMgr = require("./chat-server/usermgr");
global.groupMgr = require("./chat-server/groupmgr");
global.dbMgr = require("./chat-server/dbMgr");
global.loginMgr = require("./chat-server/loginmgr");

const Server = require("./common/server");
const Config = require("./config");

class ChatServer extends Server {
    constructor() {
        super();
    }

    init() {
        network.init(Config.chatHost, Config.chatPort);
        userMgr.init();
        groupMgr.init();
        dbMgr.init();
        loginMgr.init();
    }

    startup() {
        super.startup();
        this.init();
        network.startup();
        log.info('ChatServer startup...');
    }
}

const chatServer = new ChatServer();
chatServer.startup();