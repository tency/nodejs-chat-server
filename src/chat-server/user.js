'use strict';

const log = logger.getLogger("user");

module.exports = class User {
    constructor() {
        this.userData = {};
        this.userData.uid = 0;
        this.userData.openid = "";
        this.userData.regTime = 0;
        this.userData.loginTime = 0;
        this.userData.loginIp = "";
        this.userData.nick = "";
        this.userData.gender = "male";
        this.userData.avatar = "default";

        this.loginID = 0; // 玩家所在的login server id
        this.dirty = false;
    }

    init(uid, openid, nick, loginid) {
        this.userData.uid = uid;
        this.userData.openid = openid;
        this.userData.nick = nick;
        this.loginID = loginid;
        this.dirty = true;
    }

    getUserData() {
        return this.userData;
    }

    getLoginID() {
        return this.loginID;
    }

    getUid() {
        return this.userData.uid;
    }

    getOpenid() {
        return this.userData.openid;
    }

    getLoginTime() {
        return this.userData.loginTime;
    }

    getLoginIp() {
        return this.userData.loginIp;
    }

    getAvatar() {
        return this.userData.avatar;
    }

    setNick(name) {
        this.userData.nick = name;
        this.setDirty();
    }

    setAvatar(avatar) {
        this.userData.avatar = avatar;
        this.setDirty();
    }

    setDirty() {
        this.dirty = true;
    }

    onCreate() {
        log.debug("on user create, uid = %d", this.userData.uid);
    }

    onRemove() {
        log.debug("on user remove, uid = %d", this.userData.uid);
        if (this.dirty) {
            this.save(() => {
                // 保存完设置为false
                this.dirty = false;
            });
        }
    }

    save(callback) {
        dbMgr.getUserModel().find({
                uid: this.userData.uid
            })
            .then(users => {
                let user = users[0];

                // 修改要保存的项
                user.set('nick', this.userData.nick);
                user.set('avatar', this.userData.avatar);
                user.save(null, callback);
            });
    }
}