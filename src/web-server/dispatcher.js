'use strict';

const log = logger.getLogger("dispatcher");
const MSG_ID = require("../common/define").MSG_ID;

module.exports = class Dispatcher {
    constructor() {
        log.debug("Dispatcher constructor");
    }

    // 订阅消息
    subscribeMessage() {
        //==== chat server 过来的消息
        // network.chatWS.on(MSG_ID.CS2L_ADD_FRIEND, (data) => {
        //     log.info("on message CS2L_ADD_FRIEND");
        //     log.info(data);

        //     const user = userMgr.getUser(data.id);
        //     if (user) {
        //         let connID = user.getConnId();
        //         log.info("notify connID = %d", connID);
        //         network.connector.message(connID, MSG_ID.L2C_ADD_FRIEND, data.newFriend);
        //     } else {
        //         log.error("cant find user, id = %s", data.id);
        //     }
        // });
    }
}