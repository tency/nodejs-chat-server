'use strict';

const log = logger.getLogger("chatmgr");
const ErrCode = require("../common/define").ErrCode;
const MSG_ID = require("../common/define").MSG_ID;

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
    handleSendChat(conID, data, callback) {
        log.debug(data);

        data.mine.mine = false;
        if (data.to.type == "group") {
            // 群组聊天
            let group = groupMgr.getGroup(data.to.id);
            if (group) {
                network.broadcastToLogin(MSG_ID.CS2L_NOTIFY_CHAT, data);
            } else {
                callback && callback(ErrCode.FAILED, "group not exist!");
            }
        } else if (data.to.type == "friend") {
            // 好友聊天
            let user = userMgr.getUser(data.to.id);
            if (user) {
                if (user.hasFriend(data.mine.id)) {
                    // 已经是好友
                    network.messageLogin(user.getLoginID(), MSG_ID.CS2L_NOTIFY_CHAT, data);
                } else {
                    // 还不是好友
                    callback && callback(ErrCode.FAILED, "not friend!");
                }
            } else {
                callback && callback(ErrCode.FAILED, "user not exist!");
            }
        }
    }
}

let chatMgr = global.chatMgr || new ChatMgr();
module.exports = chatMgr;