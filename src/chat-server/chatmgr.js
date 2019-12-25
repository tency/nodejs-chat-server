'use strict';

const log = logger.getLogger("chatmgr");
const ErrCode = require("../common/define").ErrCode;
const MSG_ID = require("../common/define").MSG_ID;
const Utility = require("../common/utility");

// 聊天管理器
class ChatMgr {
    constructor() {
        //  1v1聊天记录，用id_id作为logId
        this.chatLog = {};

        // id与logId对应表，方便快速查找指定玩家的记录
        this.idLogIdTab = {};

        // 缓存待发送信息，例如发给不在线的玩家，希望玩家在上线是能收到新消息
        this.waitSendMessage = {};
    }

    init() {

    }

    // 处理聊天信息
    handleSendChat(conID, data, callback) {
        log.debug(data);

        data.mine.mine = false;
        data.timestamp = new Date().getTime();

        // 检查是不是命令
        let isCommand = false;
        if (data.mine.content[0] == '/') {
            if (data.mine.content.substr(0, 8) == "/popular") {
                isCommand = true;
                data.mine.username = "system";
                data.mine.avatar = "http://www.tap2joy.com/chat/static/img/system.jpg";
                data.mine.content = cacheMgr.getMostPopularWord();
                callback && callback(ErrCode.COMMAND, data);
            } else if (data.mine.content.substr(0, 6) == "/stats") {
                isCommand = true;
                // 获取玩家名字参数
                let username = data.mine.content.substr(7, data.mine.content.length);
                let user = userMgr.getUserByName(username);
                if (user) {
                    let onlineTime = user.getOnlineTime();
                    let timeStr = Utility.formatTimeWithInitial(onlineTime, ["d", "h", "m", "s"]);
                    data.mine.content = timeStr;
                    data.mine.username = "system";
                    data.mine.avatar = "http://www.tap2joy.com/chat/static/img/system.jpg";
                    callback && callback(ErrCode.COMMAND, data);
                } else {
                    callback && callback(ErrCode.FAILED, "can't find user " + username);
                }
            }
        }
        if (!isCommand) {
            // 进行最受欢迎的词统计，过滤之前处理，处理之后就有很多***了
            cacheMgr.addNewContent(data.mine.content);

            // 先对聊天内容进行过滤
            data.mine.content = stringFilter.replace(data.mine.content, "***");

            if (data.to.type == "group") {
                // 群组聊天
                let group = groupMgr.getGroup(data.to.id);
                if (group) {
                    data.to.members = group.getGroupData().members;
                    network.broadcastToLogin(MSG_ID.CS2L_NOTIFY_CHAT, data);

                    // 添加至群聊天记录
                    group.addChatLog(data);

                    callback && callback(ErrCode.SUCCESS, "send chat suss!");
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

                        let key = this.getLogId(data.mine.id, data.to.id);
                        this.addFriendChatLog(key, data);

                        callback && callback(ErrCode.SUCCESS, data);
                    } else {
                        // 还不是好友
                        callback && callback(ErrCode.FAILED, "not friend!");
                    }
                } else {
                    callback && callback(ErrCode.FAILED, "user not exist!");
                }
            } else {
                // 不支持的类型
                callback && callback(ErrCode.FAILED, "not support type!");
            }
        }
    }

    handleGetLog(conID, data, callback) {
        if (data.type == "group") {
            let group = groupMgr.getGroup(data.id);
            if (group) {
                callback && callback(ErrCode.SUCCESS, group.getChatLog());
            } else {
                callback && callback(ErrCode.FAILED, "user not exist!");
            }
        } else if (data.type == "friend") {
            callback && callback(ErrCode.SUCCESS, this.getChatLog(data.id, data.targetId));
        }
    }

    // 生成logid，小的放前面
    getLogId(id1, id2) {
        if (parseInt(id1) > parseInt(id2)) {
            return id2 + "_" + id1;
        } else {
            return id1 + "_" + id2;
        }
    }

    // 添加好友聊天记录
    addFriendChatLog(key, chat) {
        if (!this.chatLog[key]) {
            this.chatLog[key] = [];
        }

        this.chatLog[key].push(chat);

        // 只保留最近100条
        if (this.chatLog[key].length > 100) {
            this.chatLog[key].splice(0, 1);
        }
    }

    // 获取两个用户之间的聊天记录
    getChatLog(id1, id2) {
        let key = this.getLogId(id1, id2);
        if (this.chatLog[key]) {
            return this.chatLog[key];
        }

        return [];
    }
}

let chatMgr = global.chatMgr || new ChatMgr();
module.exports = chatMgr;