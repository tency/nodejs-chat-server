'use strict';

const log = logger.getLogger("user");

module.exports = class User {
    constructor() {
        this.uid = 0; // 唯一id
        this.openid = ""; // 账号
        this.connId = 0; // 连接id
    }

    init(uid, openid, connid) {
        this.uid = uid;
        this.openid = openid;
        this.connId = connid;
    }

    getUid() {
        return this.uid;
    }

    getOpenid() {
        return this.openid;
    }

    getConnId() {
        return this.connId;
    }

    onCreate() {
        log.info("on create user, uid = ", this.uid);
    }

    onRemove() {
        log.info("on remove user, uid = %d", this.uid);
    }
}