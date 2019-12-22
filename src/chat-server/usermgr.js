'use strict';

const User = require("./user");
const ErrCode = require("../common/define").ErrCode;

const log = logger.getLogger("usermgr");

// 用户管理器
class UserMgr {
    constructor() {
        log.debug("user mgr constructor");
        this.userList = {};
    }

    init() {
        log.debug("user mgr init");
    }

    getUser(uid) {
        return this.userList[uid];
    }

    createUser(uid, openid, nick, loginId) {
        let newUser = new User();
        newUser.init(uid, openid, nick, loginId);
        newUser.onCreate();
        this.userList[uid] = newUser;
    }

    // 从数据库数据构造用户
    loadUser(userData, loginId) {
        let newUser = new User();
        newUser.initWithData(userData, loginId);
        newUser.onCreate();
        this.userList[uid] = newUser;
    }

    removeUser(uid) {
        if (this.userList[uid]) {
            this.userList[uid].onRemove();
            delete this.userList[uid];
        }
    }

    // 修改昵称
    handleModifyNick(conID, data, callback) {
        let user = this.getUser(data.uid);
        if (!user) {
            log.error("can't find user, uid = %s", data.uid);
            callback && callback(ErrCode.FAIL);
            return;
        }

        user.setNick(data.nick);
        callback && callback(ErrCode.SUCCESS, user.getNick());
    }

    // 修改头像
    handleModifyAvatar(conID, data, callback) {
        let user = this.getUser(data.uid);
        if (!user) {
            log.error("can't find user, uid = %s", data.uid);
            callback && callback(ErrCode.FAIL);
            return;
        }

        user.setAvatar(data.avatar);
        callback && callback(ErrCode.SUCCESS, user.getAvatar());
    }
}

let userMgr = global.userMgr || new UserMgr();
module.exports = userMgr;