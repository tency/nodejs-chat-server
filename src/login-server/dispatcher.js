'use strict';

const log = logger.getLogger("dispatcher");
const MSG_ID = require("../common/define").MSG_ID;

module.exports = class Dispatcher {
    constructor() {
        log.debug("Dispatcher constructor");
    }

    // 订阅消息
    subscribeMessage() {
        // 处理用户登录
        network.connector.on(MSG_ID.C2L_USER_LOGIN, (conID, data, callback) => {
            log.info("on message C2L_USER_LOGIN");
            loginMgr.handleUserLogin(conID, data, callback);
        });

        // 处理用户登出
        network.connector.on(MSG_ID.C2L_USER_LOGOUT, (conID, data, callback) => {
            log.info("on message C2L_USER_LOGOUT");
            loginMgr.handleUserLogout(conID, data, callback);
        });

        // 处理修改签名
        network.connector.on(MSG_ID.C2L_MODIFY_SIGN, (conID, data, callback) => {
            log.info("on message C2L_MODIFY_SIGN");
            userMgr.handleModifySign(conID, data, callback);
        });

        // 处理修改头像
        network.connector.on(MSG_ID.C2L_MODIFY_AVATAR, (conID, data, callback) => {
            log.info("on message C2L_MODIFY_SIGN");
            userMgr.handleModifyAvatar(conID, data, callback);
        });

        // 处理修改昵称
        network.connector.on(MSG_ID.C2L_MODIFY_NICK, (conID, data, callback) => {
            log.info("on message C2L_MODIFY_SIGN");
            userMgr.handleModifyNick(conID, data, callback);
        });
    }
}