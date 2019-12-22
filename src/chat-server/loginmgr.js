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
            uid: data.uid,
            openid: data.openid,

            regTime: Utility.getTime(),
            loginTime: Utility.getTime(),
            loginIp: "",

            nick: this.generateNick(),
            gender: "male",
            avatar: "default",

            friends: [],
        };

        dbMgr.getUserModel().create(initData)
            .then(() => {
                userMgr.createUser(initData.uid, initData.openid, initData.nick, data.loginid);
                callback(ErrCode.SUCCESS, initData);
            });
    }

    // 获取用户数据
    handleGetUser(conID, data, callback) {
        log.debug('handleGetUser data = ');
        log.debug(data);

        let uid = data.uid;
        let user = userMgr.getUser(uid);
        if (user) {
            log.warn('user is already login');
            callback && callback(ErrCode.SUCCESS, user.getUserData());
        } else {
            dbMgr.getUserModel().find({
                uid: data.uid
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
        let uid = data.uid;
        let user = userMgr.getUser(uid);
        if (!user) {
            log.error('can not find user, uid = ' + uid);
            callback(ErrCode.FAILED);
            return;
        }

        userMgr.removeUser(uid);
        callback && callback(err, data);
    }

    // 生成昵称
    generateNick() {
        return '游客' + Utility.randomNumber(1, 100);
    }
}

let loginMgr = global.loginMgr || new LoginMgr();
module.exports = loginMgr;