global.logger = require("./common/logger");
const WS = require("./common/ws-server");

logger.setupLog("chatServer");

let log = logger.getLogger("start");
log.info('chat server start')

let wsInst = new WS();