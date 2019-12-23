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

        // 处理修改签名
        network.connector.on(MSG_ID.L2CS_MODIFY_SIGN, (conID, data, callback) => {
            log.info("on message L2CS_MODIFY_SIGN");
            userMgr.handleModifySign(conID, data, callback);
        });

        // 处理修改头像
        network.connector.on(MSG_ID.L2CS_MODIFY_AVATAR, (conID, data, callback) => {
            log.info("on message L2CS_MODIFY_AVATAR");
            userMgr.handleModifyAvatar(conID, data, callback);
        });

        // 处理修改昵称
        network.connector.on(MSG_ID.L2CS_MODIFY_NICK, (conID, data, callback) => {
            log.info("on message L2CS_MODIFY_NICK");
            userMgr.handleModifyNick(conID, data, callback);
        });

        // 处理添加好友
        network.connector.on(MSG_ID.L2CS_ADD_FRIEND, (conID, data, callback) => {
            log.info("on message L2CS_ADD_FRIEND");
            userMgr.handleAddFriend(conID, data, callback);
        });

        // 处理获取群成员
        network.connector.on(MSG_ID.W2CS_GET_GROUP_MEMBERS, (conID, data, callback) => {
            log.info("on message W2CS_GET_GROUP_MEMBERS");
            groupMgr.handleGetMembers(conID, data, callback);
        });

        // 处理聊天消息
        network.connector.on(MSG_ID.L2CS_SEND_CHAT, (conID, data, callback) => {
            log.info("on message L2CS_SEND_CHAT");
            chatMgr.handleSendChat(conID, data, callback);
        });

        // 处理聊天记录
        network.connector.on(MSG_ID.L2CS_GET_LOG, (conID, data, callback) => {
            log.info("on message L2CS_GET_LOG");
            chatMgr.handleGetLog(conID, data, callback);
        });

        // 处理获取最受欢迎的词
        network.connector.on(MSG_ID.W2CS_GET_POPULAR_WORD, (conID, data, callback) => {
            log.info("on message W2CS_GET_POPULAR_WORD");
            groupMgr.handleGetPopularWord(conID, data, callback);
        });

        // 处理获取用户状态
        network.connector.on(MSG_ID.W2CS_GET_USER_STATUS, (conID, data, callback) => {
            log.info("on message W2CS_GET_USER_STATUS");
            groupMgr.handleGetUserStatus(conID, data, callback);
        });
    }
}