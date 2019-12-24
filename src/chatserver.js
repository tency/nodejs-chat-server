global.logger = require("./common/logger");
//global.logger = require("./common/logger-winston");
logger.setupLog("chatServer", "debug");

const path = require("path");
let log = logger.getLogger("start");
const Utility = require("./common/utility");

global.network = require("./chat-server/network");
global.userMgr = require("./chat-server/usermgr");
global.groupMgr = require("./chat-server/groupmgr");
global.dbMgr = require("./chat-server/dbMgr");
global.loginMgr = require("./chat-server/loginmgr");
global.cacheMgr = require("./chat-server/cachemgr");
global.chatMgr = require("./chat-server/chatmgr");
global.stringFilter = require("./common/stringfilter");

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
                const fullpath = path.join(process.cwd(), "./data/list.txt");
                stringFilter.loadFilterWords(fullpath, () => {
                    network.init(Config.chatHost, Config.chatPort);
                    userMgr.init();
                    groupMgr.init();
                    loginMgr.init();
                    chatMgr.init();
                    callback && callback();
                });
            });
    }

    startup() {
        this.init(() => {
            super.startup();
            network.startup();
            setInterval(this.onTick, 1000);
            log.info('ChatServer startup...');
        })
    }

    shutdown() {
        network.shutdown();
    }

    onTick() {
        //log.debug("on tick, time = %d", Utility.getTime());
        const curTime = Utility.getTime();
        userMgr.onTick();
        groupMgr.onTick();
        cacheMgr.onTick(curTime);
    }
}

const chatServer = new ChatServer();
chatServer.startup();