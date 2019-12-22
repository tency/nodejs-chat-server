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

        // 处理添加好友
        network.connector.on(MSG_ID.C2L_ADD_FRIEND, (conID, data, callback) => {
            log.info("on message C2L_ADD_FRIEND");
            log.info(data);
            userMgr.handleAddFriend(conID, data, callback);
        });

        //==== chat server 过来的消息
        network.chatWS.on(MSG_ID.CS2L_ADD_FRIEND, (data) => {
            log.info("on message CS2L_ADD_FRIEND");
            log.info(data);

            const user = userMgr.getUser(data.id);
            if (user) {
                let connID = user.getConnId();
                log.info("notify connID = %d", connID);
                network.connector.message(connID, MSG_ID.L2C_ADD_FRIEND, data.newFriend);
            } else {
                log.error("cant find user, id = %s", data.id);
            }
        });
    }
}