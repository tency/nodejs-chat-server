'use strict';

const ErrCode = require("../common/define").ErrCode;
const MSG_ID = require("../common/define").MSG_ID;
const Utility = require("../common/utility");
const Md5 = require("md5");
const log = logger.getLogger("login");

class LoginMgr {
    constructor() {
        this.connMap = {}; // 记录connId与id的对应关系，以便在连接端口的时候移除对应的用户
    }

    init() {

    }

    // 处理登录
    handleUserLogin(conID, data, callback) {
        try {
            if (data.account == '') {
                // 账号为空，新建游客账号
                this.createNewUser(conID, data.account, data.pwd, callback);
            } else {
                dbMgr.getDbPlat().findOne({
                    _id: data.account
                }, (err, result) => {
                    log.debug('findOne err = ' + err)
                    if (err) {
                        callback(ErrCode.FAILED);
                    } else if (!result) {
                        // 账号不存在，自动注册
                        log.warn('can not find openid = %s, so create new one!', data.account);
                        this.createNewUser(conID, data.account, data.pwd, callback);
                    } else {
                        log.info('data.pwd = %s', data.pwd)
                        log.info('result.password = %s', result.password)
                        if (Md5(data.pwd) == result.password) {
                            log.info('login succeed');

                            this.requestLoginChatServer(conID, result.id, result.openid, callback);
                        } else {
                            // 密码错误
                            callback(ErrCode.PASSWORDERROR);
                        }
                    }
                });
            }
        } catch (error) {
            log.error(error.stack);
        }
    }

    handleUserLogout(conID, data, callback) {
        let id = data.id;
        let user = userMgr.getUser(id);
        if (!user) {
            log.error("cant find user when logout, id = %d", id);
            callback(ErrCode.FAILED);
            return;
        }

        // 通知chat server 登出
    }

    // 创建一个新用户
    createNewUser(conID, account, password, callback) {
        const self = this;

        dbMgr.getDbPlat().findOneAndUpdate({
            _id: '_userid'
        }, {
            $inc: {
                'ai': 1
            }
        }, {
            'returnOriginal': false
        }, function (err, result) {
            if (!err) {
                var newUID = result.value.ai;

                let openid = account;
                if (!openid || openid == "") {
                    openid = Utility.randomString(8) + newUID;
                }

                let pwd = password;
                if (!pwd || pwd == "") {
                    // 随机一个16位的密码
                    pwd = Utility.randomString(16);
                }
                const storePwd = Md5(pwd); // 数据库存md5密码
                log.debug('newUID = %d', newUID);

                self.registerUser(conID, newUID, openid, (err, data) => {
                    dbMgr.getDbPlat().insertOne({
                        _id: openid,
                        id: newUID,
                        password: storePwd,
                        time: Utility.getTime()
                    }, function (err, result) {
                        if (err) {
                            log.error('plat insert new user failed! err = %s', err);
                        } else {
                            log.info('create a new user suss');
                            callback && callback(ErrCode.SUCCESS, data);
                        };
                    });
                }, pwd);
            } else {
                log.error('inc plat id error');
            }
        });
    }

    registerUser(conID, id, openid, callback, pwd) {
        let userData = {
            id: id,
            openid: openid,
            loginid: network.getLoginID()
        };

        network.requestChat(MSG_ID.L2CS_USER_CREATE, userData, (err, data) => {
            log.info('receive chat server resp');

            // 传给客户端的是明文密码，可以让客户端展示出来
            if (pwd) {
                data.password = pwd;
            }
            userMgr.createUser(id, openid, conID);
            callback && callback(err, data);
        });
    }

    logoutUser(id, callback) {
        let user = userMgr.getUser(id);
        if (user) {
            let reqData = {
                id: user.getId(),
                openid: user.getOpenid(),
            }
            network.requestChat(MSG_ID.GA2G_LOGOUT_USER, reqData, (err, data) => {
                if (err) {
                    log.error('user logout chat server failed, openid = %s, err = %s', openid, err);
                    callback && callback(ErrCode.FAILED);
                } else {
                    log.info('user logout chat server suss, openid = %s', openid);
                    userMgr.removeUser(id);
                    callback && callback(ErrCode.SUCCESS);
                }
            });
        } else {
            log.error('can not find user, openid = ' + openid);
            callback && callback(ErrCode.FAILED);
        }
    }

    // 向chatServer请求登录数据
    requestLoginChatServer(conID, id, openid, callback) {
        let userData = {
            id: id,
            openid: openid,
            loginid: network.getLoginID()
        };

        network.requestChat(MSG_ID.L2CS_USER_GET, userData, (err, data) => {
            log.info('receive chat server resp, err = %s', err);

            let user = userMgr.getUser(data.mine.id);
            if (user) {
                // 更新conid,其他信息不变
                user.setConnId(conID);
            } else {
                userMgr.createUser(data.mine.id, data.mine.openid, conID);
            }

            this.connMap[conID] = data.mine.openid;

            callback && callback(err, data);
        });
    }

    // 客户端断开
    onClientDisconnect(conID, code, reason) {
        log.info('onClientDisconnect conID = ' + conID + ', code = ' + code + ', reason = ' + reason);
        let id = this.connMap[conID];
        if (id) {
            // 通知chat server客户端断开
            this.logoutUser(id, () => {
                log.info("user logout, id = %d", id);
            });
        } else {
            log.error('onClientDisconnect user not exist, conID = ' + conID);
        }
    }
}

let loginMgr = global.loginMgr || new LoginMgr();
module.exports = loginMgr;