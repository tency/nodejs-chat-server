global.logger = require("./common/logger");
//global.logger = require("./common/logger-winston");
logger.setupLog("chatServer", "debug");

let log = logger.getLogger("start");

global.network = require("./chat-server/network");
global.userMgr = require("./chat-server/usermgr");
global.groupMgr = require("./chat-server/groupmgr");
global.dbMgr = require("./chat-server/dbMgr");
global.loginMgr = require("./chat-server/loginmgr");
global.cacheMgr = require("./chat-server/cachemgr");
global.chatMgr = require("./chat-server/chatmgr");

const Server = require("./common/server");
const Config = require("./config");

class ChatServer extends Server {
    constructor() {
        super();
    }

    init(callback) {
        dbMgr.init()
            .then(() => {
                return cacheMgr.init();
            })
            .then(() => {
                network.init(Config.chatHost, Config.chatPort);
                userMgr.init();
                groupMgr.init();
                loginMgr.init();
                chatMgr.init();
                callback && callback();
            });
    }

    startup() {
        this.init(() => {
            super.startup();
            network.startup();
            log.info('ChatServer startup...');
        })
    }
}

const chatServer = new ChatServer();
chatServer.startup();