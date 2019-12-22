'use strict';

const log = logger.getLogger("user");

module.exports = class User {
    constructor() {
        this.userData = {};
        this.userData.id = 0;
        this.userData.openid = "";
        this.userData.loginIp = "";
        this.userData.username = "";
        this.userData.gender = "male";
        this.userData.avatar = "default";
        this.userData.sign = "Hello Node";
        this.userData.friends = {};

        this.loginID = 0; // 玩家所在的login server id
        this.dirty = 0; //按位更新
    }

    init(id, openid, username, loginid) {
        this.userData.id = id;
        this.userData.openid = openid;
        this.userData.username = username;
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

    getId() {
        return this.userData.id;
    }

    getNick() {
        return this.userData.username;
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
        this.userData.username = name;
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
        log.debug("on user create, id = %d", this.userData.id);
    }

    onRemove() {
        log.debug("on user remove, id = %d", this.userData.id);
        if (this.dirty > 0) {
            this.save(() => {
                // 保存完设置为0
                this.dirty = 0;
                log.debug("user save finish, id = %d", this.userData.id);
            });
        }
    }

    save(callback) {
        dbMgr.getUserModel().find({
                id: this.userData.id
            })
            .then(users => {
                let user = users[0];

                // 修改要保存的项
                if (this.dirty & 1 != 0) {
                    user.set("loginIp", this.userData.loginIp);
                }
                if (this.dirty & 2 != 0) {
                    user.set('username', this.userData.username);
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