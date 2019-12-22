'use strict';

const log = logger.getLogger("chatmgr");

// 聊天管理器
class ChatMgr {
    constructor() {
        //  1v1聊天记录，用id_id作为logId
        this.chatLog = {};

        // id与logId对应表，方便快速查找指定玩家的记录
        this.idLogIdTab = {};

        // 群聊天记录，用群id做key
        this.groupChatLog = {};

        // 缓存待发送信息，例如发给不在线的玩家，希望玩家在上线是能收到新消息
        this.waitSendMessage = {};
    }

    init() {

    }

    // 处理聊天信息
    handleChat(conID, data, callback) {

    }

    // 添加好友
    handleAddFriend(conID, data, callback) {

    }

    // 删除好友
    handleRemoveFriend(conID, data, callback) {

    }
}

let chatMgr = global.chatMgr || new ChatMgr();
module.exports = chatMgr;