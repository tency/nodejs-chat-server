'use strict';

const User = require("./user");
const MSG_ID = require("../common/define").MSG_ID;
const log = logger.getLogger("usermgr");

// 用户管理器
class UserMgr {
    constructor() {
        log.debug("user mgr constructor");
        this.userList = {};
        this.openid2id = {};
    }

    init() {
        log.debug("user mgr init");
    }

    getUser(id) {
        return this.userList[id];
    }

    // 根据openid查找用户
    getUserByOpenid(openid) {
        let id = this.openid2id[openid];
        return this.getUser(id);
    }

    createUser(id, openid, connid) {
        let newUser = new User();
        newUser.init(id, openid, connid);
        newUser.onCreate();
        this.userList[id] = newUser;
        this.openid2id[openid] = id;
    }

    removeUser(id) {
        if (this.userList[id]) {
            this.userList[id].onRemove();
            delete this.userList[id];
        }
    }

    handleModifySign(conID, data, callback) {
        network.requestChat(MSG_ID.L2CS_MODIFY_SIGN, data, callback);
    }

    handleModifyAvatar(conID, data, callback) {
        network.requestChat(MSG_ID.L2CS_MODIFY_AVATAR, data, callback);
    }

    handleModifyNick(conID, data, callback) {
        network.requestChat(MSG_ID.L2CS_MODIFY_NICK, data, callback);
    }
}

let userMgr = global.userMgr || new UserMgr();
module.exports = userMgr;