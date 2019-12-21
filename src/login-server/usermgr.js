'use strict';

const User = require("./user");
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

    createUser(uid, openid, connid) {
        let newUser = new User();
        newUser.init(uid, openid, connid);
        newUser.onCreate();
        this.userList[uid] = newUser;
    }

    removeUser(uid) {
        if (this.userList[uid]) {
            this.userList[uid].onRemove();
            delete this.userList[uid];
        }
    }
}

let userMgr = global.userMgr || new UserMgr();
module.exports = userMgr;