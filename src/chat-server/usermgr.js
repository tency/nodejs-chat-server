'use strict';

const log = logger.getLogger("usermgr");

// 用户管理器
class UserMgr {
    constructor() {
        log.debug("user mgr constructor");
    }

    init() {
        log.debug("user mgr init");
    }
}

let userMgr = global.userMgr || new UserMgr();
module.exports = userMgr;