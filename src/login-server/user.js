'use strict';

const log = logger.getLogger("user");

module.exports = class User {
    constructor() {
        this.id = 0; // 唯一id
        this.openid = ""; // 账号
        this.connId = 0; // 连接id
    }

    init(id, openid, connid) {
        this.id = id;
        this.openid = openid;
        this.connId = connid;
    }

    getId() {
        return this.id;
    }

    getOpenid() {
        return this.openid;
    }

    getConnId() {
        return this.connId;
    }

    onCreate() {
        log.info("on create user, id = ", this.id);
    }

    onRemove() {
        log.info("on remove user, id = %d", this.id);
    }
}