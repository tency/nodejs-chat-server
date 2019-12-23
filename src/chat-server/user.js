'use strict';

const Utility = require("../common/utility");
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
        this.userData.friends = [];
        this.friendList = []; // 好友的信息，friends只存了好友id，这里缓存好友的一些信息

        this.loginID = 0; // 玩家所在的login server id
        this.dirty = 0; //按位更新
        this.loginTime = 0; // 上线时间
        this.offlineTime = 0; // 记录一下离线时间，离线超过一定时间再从管理器中移除
        this.lastSaveTime = 0; // 上一次保存时间，为了控制保存的频率
    }

    init(id, openid, username, loginid) {
        this.userData.id = id;
        this.userData.openid = openid;
        this.userData.username = username;
        this.loginID = loginid;
        this.lastSaveTime = Utility.getTime();
        this.loginTime = Utility.getTime();
    }

    initWithData(data, loginid) {
        this.userData = data;
        this.friendList = []; // 好友的信息，friends只存了好友id，这里缓存好友的一些信息
        this.loginID = loginid;
        this.lastSaveTime = Utility.getTime();
        this.loginTime = Utility.getTime();
    }

    onTick() {
        this.save(false, () => {
            this.dirty = 0;
            this.lastSaveTime = Utility.getTime();
        })
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
        //log.debug("on user create, id = %d", this.userData.id);
    }

    onRemove() {
        log.debug("on user remove, id = %d", this.userData.id);
        if (this.dirty > 0) {
            this.save(true, () => {
                // 保存完设置为0
                this.dirty = 0;
                this.offlineTime = Utility.getTime();
                this.lastSaveTime = this.offlineTime;
                this.loginTime = 0;
                log.debug("user save finish, id = %d", this.userData.id);
            });
        }
    }

    save(force, callback) {
        if (!force && Utility.getTime() - this.lastSaveTime < 10) {
            return;
        }

        if (this.dirty > 0) {
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
                    if (this.dirty & 16 != 0) {
                        user.set('friends', this.userData.friends);
                    }

                    user.save(null, callback);
                });
        }
    }

    // 获取好友列表
    getFriendList(callback) {
        // 还没构建过，就构建一下
        if (!this.friendList) {
            this.friendList = [];
        }

        if (this.friendList.length == 0 && this.userData.friends.length > 0) {
            this.buildFriendList(() => {
                log.debug(this.userData)
                callback && callback(this.friendList);
            });
        } else {
            callback && callback(this.friendList);
        }
    }

    // 构建好友列表
    buildFriendList(callback) {
        for (let i = 0; i < this.userData.friends.length; i++) {
            this.addFriendInfo(parseInt(this.userData.friends[i]), callback);
        }
    }

    addFriendInfo(id, callback) {
        let user = userMgr.getUser(id);
        if (user) {
            let newFriend = {
                id: user.getId(),
                username: user.getNick(),
                avatar: user.getAvatar(),
                sign: user.getSign(),
                status: "online"
            }
            this.friendList.push(newFriend);
            if (this.friendList.length == this.userData.friends.length) {
                callback && callback(newFriend);
            }
        } else {
            // 不在线，从数据库查找
            dbMgr.getUserModel().find({
                id: id
            }).then((users) => {
                let userData = users[0];
                if (userData) {
                    let newFriend = {
                        id: userData.id,
                        username: userData.username,
                        avatar: userData.avatar,
                        sign: userData.sign,
                        status: "online"
                    }
                    this.friendList.push(newFriend);

                    if (this.friendList.length == this.userData.friends.length) {
                        callback && callback(newFriend);
                    }
                }
            });
        }
    }

    // 移除好友信息
    removeFriendInfo(id) {
        for (let i = 0; i < this.friendList.length; i++) {
            if (this.friendList[i].id == id) {
                this.friendList.splice(i, 1);
                break;
            }
        }
    }

    // 添加好友
    addFriend(id, callback) {
        if (this.hasFriend(id)) {
            callback && callback({});
            return;
        }

        this.userData.friends.push(id);
        this.setDirty(4);
        this.addFriendInfo(id, (friendInfo) => {
            callback && callback(friendInfo);
        });
    }

    hasFriend(id) {
        return this.userData.friends.indexOf(id) >= 0;
    }

    removeFriend(id) {
        let index = this.userData.friends.indexOf(id)
        if (index >= 0) {
            this.userData.friends.splice(index, 1);
            this.removeFriendInfo(id);
            this.setDirty(4);
        }
    }

    // 获取本次在线时间
    getOnlineTime() {
        if (this.loginTime == 0) {
            return 0;
        }
        return Utility.getTime() - this.loginTime;
    }
}