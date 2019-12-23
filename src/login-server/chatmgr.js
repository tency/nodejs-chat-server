'use strict';

const log = logger.getLogger("chatmgr");
const MSG_ID = require("../common/define").MSG_ID;

// 聊天管理器
class ChatMgr {
    constructor() {

    }

    init() {

    }

    // 处理聊天信息
    handleSendChat(conID, data, callback) {
        // 先对聊天内容进行过滤
        data.mine.content = stringFilter.replace(data.mine.content, "***");

        network.requestChat(MSG_ID.L2CS_SEND_CHAT, data, callback);
    }
}

let chatMgr = global.chatMgr || new ChatMgr();
module.exports = chatMgr;