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

    getUser(id) {
        return this.userList[id];
    }

    createUser(id, openid, nick, loginId) {
        let newUser = new User();
        newUser.init(id, openid, nick, loginId);
        newUser.onCreate();
        this.userList[id] = newUser;
    }

    // 从数据库数据构造用户
    loadUser(userData, loginId) {
        let newUser = new User();
        newUser.initWithData(userData, loginId);
        newUser.onCreate();
        this.userList[userData.id] = newUser;
    }

    removeUser(id) {
        if (this.userList[id]) {
            this.userList[id].onRemove();
            delete this.userList[id];
        }
    }

    // 修改昵称
    handleModifyNick(conID, data, callback) {
        let user = this.getUser(data.id);
        if (!user) {
            log.error("can't find user, id = %s", data.id);
            callback && callback(ErrCode.FAIL);
            return;
        }

        user.setNick(data.nick);
        callback && callback(ErrCode.SUCCESS, user.getNick());
    }

    // 修改头像
    handleModifyAvatar(conID, data, callback) {
        let user = this.getUser(data.id);
        if (!user) {
            log.error("can't find user, id = %s", data.id);
            callback && callback(ErrCode.FAIL);
            return;
        }

        user.setAvatar(data.avatar);
        callback && callback(ErrCode.SUCCESS, user.getAvatar());
    }

    handleModifySign(conID, data, callback) {
        let user = this.getUser(data.id);
        if (!user) {
            log.error("can't find user, id = %s", data.id);
            callback && callback(ErrCode.FAIL);
            return;
        }

        user.setSign(data.sign);
        callback && callback(ErrCode.SUCCESS, user.getSign());
    }
}

let userMgr = global.userMgr || new UserMgr();
module.exports = userMgr;