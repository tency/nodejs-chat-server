'use strict';

const log = logger.getLogger("user");

module.exports = class User {
    constructor() {
        this.userData = {};
        this.userData.uid = 0;
        this.userData.openid = "";
        this.userData.loginIp = "";
        this.userData.nick = "";
        this.userData.gender = "male";
        this.userData.avatar = "default";
        this.userData.sign = "Hello Node";
        this.userData.friends = {};

        this.loginID = 0; // 玩家所在的login server id
        this.dirty = 0; //按位更新
    }

    init(uid, openid, nick, loginid) {
        this.userData.uid = uid;
        this.userData.openid = openid;
        this.userData.nick = nick;
        this.loginID = loginid;
    }

    initWithData(data, loginid) {
        this.userData = data;
        this.loginID = loginid;
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

    getLoginIp() {
        return this.userData.loginIp;
    }

    getAvatar() {
        return this.userData.avatar;
    }

    getSign() {
        return this.userData.sign;
    }

    setLoginIp(ip) {
        this.userData.loginIp = ip;
        this.setDirty(0);
    }

    setNick(name) {
        this.userData.nick = name;
        this.setDirty(1);
    }

    setAvatar(avatar) {
        this.userData.avatar = avatar;
        this.setDirty(2);
    }

    setSign(sign) {
        this.userData.sign = sign;
        this.setDirty(3);
    }

    setDirty(index) {
        this.dirty &= (1 << index);
    }

    onCreate() {
        log.debug("on user create, uid = %d", this.userData.uid);
    }

    onRemove() {
        log.debug("on user remove, uid = %d", this.userData.uid);
        if (this.dirty > 0) {
            this.save(() => {
                // 保存完设置为0
                this.dirty = 0;
                log.debug("user save finish, uid = %d", this.userData.uid);
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
                if (this.dirty & 1 != 0) {
                    user.set("loginIp", this.userData.loginIp);
                }
                if (this.dirty & 2 != 0) {
                    user.set('nick', this.userData.nick);
                }
                if (this.dirty & 4 != 0) {
                    user.set('avatar', this.userData.avatar);
                }
                if (this.dirty & 8 != 0) {
                    user.set('sign', this.userData.sign);
                }

                user.save(null, callback);
            });
    }

    // 获取好友列表
    getFriendList() {

    }
}