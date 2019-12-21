'use strict';

const MSG_ID = require("../common/define").MSG_ID;
const log = logger.getLogger("dispatcher");

module.exports = class Dispatcher {
    constructor() {
        log.debug("Dispatcher constructor");
    }

    // 订阅消息
    subscribeMessage() {
        network.connector.on(MSG_ID.L2CS_USER_CREATE, (conID, data, callback) => {
            log.info("on message L2CS_USER_CREATE");
            loginMgr.handleCreateUser(conID, data, callback);
        });

        network.connector.on(MSG_ID.L2CS_USER_GET, (conID, data, callback) => {
            log.info("on message L2CS_USER_GET");
            loginMgr.handleGetUser(conID, data, callback);
        });

        network.connector.on(MSG_ID.L2CS_USER_LOGOUT, (conID, data, callback) => {
            log.info("on message L2CS_USER_LOGOUT");
            loginMgr.handleLogoutUser(conID, data, callback);
        });
    }
}