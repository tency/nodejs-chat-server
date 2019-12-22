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

            username: this.generateNick(),
            gender: "male",
            avatar: this.generateAvatar(),
            sign: this.generateSign(),

            friends: [],
        };

        dbMgr.getUserModel().create(initData)
            .then(() => {
                userMgr.createUser(initData.id, initData.openid, initData.username, data.loginid);
                callback(ErrCode.SUCCESS, initData);
            });
    }

    // 获取用户数据
    handleGetUser(conID, data, callback) {
        log.debug('handleGetUser data = ');
        log.debug(data);

        let id = data.id;
        let user = userMgr.getUser(id);
        if (user) {
            log.warn('user is already login');
            callback && callback(ErrCode.SUCCESS, user.getUserData());
        } else {
            dbMgr.getUserModel().find({
                id: data.id
            }).then((users) => {
                let userData = users[0];
                userMgr.loadUser(userData, data.loginid);
                callback && callback(ErrCode.SUCCESS, userData);
            });;
        }
    }

    // 用户登出
    handleLogoutUser(conID, data, callback) {
        log.debug(data);
        let id = data.id;
        let user = userMgr.getUser(id);
        if (!user) {
            log.error('can not find user, id = ' + id);
            callback(ErrCode.FAILED);
            return;
        }

        userMgr.removeUser(id);
        callback && callback(err, data);
    }

    // 生成一个昵称
    generateNick() {
        return "用户" + Utility.randomNumber(1, 100);
    }

    // 随机一个头像
    generateAvatar() {
        return "a.jpg";
    }

    // 随机一个签名
    generateSign() {
        return "nothing to say";
    }
}

let loginMgr = global.loginMgr || new LoginMgr();
module.exports = loginMgr;