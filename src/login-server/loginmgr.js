'use strict';

const ErrCode = require("../common/define").ErrCode;
const MSG_ID = require("../common/define").MSG_ID;
const Utility = require("../common/utility");
const Md5 = require("md5");
const log = logger.getLogger("login");

class LoginMgr {
    constructor() {
        this.connMap = {}; // 记录connId与uid的对应关系，以便在连接端口的时候移除对应的用户
    }

    init() {

    }

    // 处理登录
    handleUserLogin(conID, data, callback) {
        if (data.account == '') {
            // 账号为空，新建游客账号
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
                    let openid = Utility.randomString(8) + newUID;

                    // 随机一个16位的密码
                    let pwd = Utility.randomString(16);
                    const storePwd = Md5.hashStr(pwd); // 数据库存md5密码

                    log.info('newUID = %d', newUID);
                    dbMgr.getDbPlat().insertOne({
                        _id: openid,
                        uid: newUID,
                        password: storePwd,
                        time: Utility.getTime()
                    }, function (err, result) {
                        if (err) {
                            log.error('plat insert new user failed! err = %s', err);
                        } else {
                            log.info('create a new user suss');

                            let userData = {
                                uid: newUID,
                                openid: openid,
                                loginid: network.getLoginID()
                            };

                            network.requestChat(MSG_ID.L2CS_USER_CREATE, userData, (err, data) => {
                                log.info('receive chat resp');

                                // 传给客户端的是明文密码，可以让客户端展示出来
                                data.password = pwd;
                                callback && callback(err, data);
                            });
                        };
                    });
                } else {
                    log.error('inc plat uid error');
                }
            });
        } else {
            // 账号不为空，检查是否已重复登录
            if (this.users[data.account]) {
                log.info('user is already login');
                this.requestLoginChatServer(conID, this.users[data.account].uid, data.account, callback);
            } else {
                dbMgr.getDbPlat().findOne({
                    _id: data.account
                }, (err, result) => {
                    log.info('findOne err = ' + err)
                    if (err) {
                        // 账号不存在
                        callback(ErrCode.FAILED);
                    } else if (!result) {
                        log.error('can not find openid = %s', data.account);
                        callback(ErrCode.FAILED);
                    } else {
                        log.info('data.pwd = %s', data.pwd)
                        log.info('result.password = %s', result.password)
                        if (Md5.hashStr(data.pwd) == result.password) {
                            log.info('login succeed');

                            this.requestLoginChatServer(conID, result.uid, result.openid, callback);
                        } else {
                            // 密码错误
                            callback(ErrCode.PASSWORDERROR);
                        }
                    }
                });
            }
        }
    }

    // 向chatServer请求登录数据
    requestLoginChatServer(conID, uid, openid, callback) {
        let userData = {
            uid: uid,
            openid: openid,
            loginid: network.getLoginID()
        };

        network.requestChat(MSG_ID.L2CS_USER_GET, userData, (err, data) => {
            log.info('receive chat server resp');

            userMgr.createUser(data.uid, data.openid, conID);
            this.connMap[conID] = data.openid;

            delete data.password;
            callback && callback(err, data);
        });
    }

    // 客户端断开
    onClientDisconnect(conID, code, reason) {
        log.info('onClientDisconnect conID = ' + conID + ', code = ' + code + ', reason = ' + reason);
        let uid = this.connMap[conID];
        if (uid) {
            // 通知chat server客户端断开
            let user = userMgr.getUser(uid);
            if (user) {
                let reqData = {
                    uid: user.getUid(),
                    openid: user.getOpenid(),
                }
                network.requestChat(MSG_ID.GA2G_LOGOUT_USER, reqData, (err, data) => {
                    if (err) {
                        log.error('user logout chat server failed, openid = %s, err = %s', openid, err);
                    } else {
                        log.info('user logout chat server suss, openid = %s', openid);
                        userMgr.removeUser(uid);
                    }
                });
            } else {
                log.error('can not find user, openid = ' + openid);
            }
        } else {
            log.error('onClientDisconnect user not exist, conID = ' + conID);
        }
    }
}

let loginMgr = global.loginMgr || new LoginMgr();
module.exports = loginMgr;