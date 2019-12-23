'use strict';

const ErrCode = require("../common/define").ErrCode;
const Utility = require("../common/utility");

const log = logger.getLogger("loginmgr");

class LoginMgr {
    constructor() {
        log.debug("chat server login mgr constructor");
    }

    init() {
        log.debug("chat server login mgr init");
    }

    // 创建新用户
    handleCreateUser(conID, data, callback) {
        const initData = {
            id: data.id,
            openid: data.openid,

            regTime: Utility.getTime(),
            loginTime: Utility.getTime(),
            loginIp: "",

            username: data.openid,
            gender: "male",
            avatar: this.generateAvatar(),
            sign: this.generateSign(),

            friends: [],
        };

        dbMgr.getUserModel().create(initData)
            .then(() => {
                userMgr.createUser(initData, data.loginid);
                let retData = {};
                retData.mine = initData;
                retData.friendList = [];
                retData.groupList = groupMgr.getGroupList()
                callback(ErrCode.SUCCESS, retData);
            });
    }

    // 获取用户数据
    handleGetUser(conID, data, callback) {
        let id = data.id;
        let user = userMgr.getUser(id);
        if (user) {
            log.warn('user is already login');
            user.getFriendList((friendList) => {
                let retData = {};
                retData.mine = user.getUserData();
                retData.friendList = friendList;
                retData.groupList = groupMgr.getGroupList()
                callback && callback(ErrCode.SUCCESS, retData);
            })
        } else {
            dbMgr.getUserModel().find({
                id: data.id
            }).then((users) => {
                let userData = users[0];
                log.debug(userData)
                userMgr.loadUser(userData, data.loginid, (user) => {
                    user.getFriendList((friendList) => {
                        let retData = {};
                        retData.mine = userData;
                        retData.friendList = friendList;
                        retData.groupList = groupMgr.getGroupList()
                        callback && callback(ErrCode.SUCCESS, retData);
                    })
                });
            });
        }
    }

    // 用户登出
    handleLogoutUser(conID, data, callback) {
        let id = data.id;
        let user = userMgr.getUser(id);
        if (!user) {
            log.error('can not find user, id = ' + id);
            callback && callback(ErrCode.FAILED);
            return;
        }

        userMgr.removeUser(id);
        callback && callback(ErrCode.SUCCESS, data);
    }

    // 生成一个昵称
    generateNick() {
        return "用户" + Utility.randomNumber(1, 100);
    }

    // 随机一个头像
    generateAvatar() {
        const index = Utility.randomNumber(1, 9);
        return "http://www.tap2joy.com/chat/static/img/a" + index + ".jpg";
    }

    // 随机一个签名
    generateSign() {
        return "nothing to say";
    }
}

let loginMgr = global.loginMgr || new LoginMgr();
module.exports = loginMgr;