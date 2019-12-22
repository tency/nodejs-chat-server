'use strict';

const EventEmitter = require("events");
const Connector = require("../common/connector");
const Dispatcher = require("./dispatcher");

const log = logger.getLogger("Network");

class Network extends EventEmitter {
    constructor() {
        super();
        log.debug("chat Network constructor");
        this.connector = new Connector();
        this.dispatcher = new Dispatcher();
        this.loginList = {};
    }

    // 初始化ip和端口
    init(host, port) {
        this.connector.host = host;
        this.connector.port = port;
    }

    // 启动
    startup() {
        // 启动监听
        this.connector.startup();

        // 监听login服务器连接
        this.connector.on("register_login", (conID, loginID, loginIp, loginPort) => {
            log.info("login server register conID = " + conID + ", loginID = " + loginID + ", ip = " + loginIp + ", port = " + loginPort);

            this.loginList[loginID] = {
                conID: conID,
                serverID: loginID,
                serverIP: loginIp,
                serverPort: loginPort
            }
        });

        // 监听login服务器移除
        this.connector.on("remove_login", (conID) => {
            log.info("remove login conID = " + conID);

            for (const id in this.loginList) {
                let loginID = parseInt(id);
                let _conID = this.loginList[loginID].conID;
                if (_conID == conID) {
                    delete this.loginList[loginID];
                }
            }
        });

        // 订阅消息
        this.dispatcher.subscribeMessage();

        log.info("network startup at %s:%d", this.connector.host, this.connector.port);
    }

    // 停止
    shutdown() {
        log.info("Network shutdown");
        this.connector.shutdown();
        this.connector = null;
        this.loginList = {};
    }

    // 发送消息到login
    requestLogin(loginID, reqID, data, callback) {
        if (this.loginList[loginID]) {
            let conID = this.loginList[loginID].conID;
            this.connector.request(conID, reqID, data, callback);
        }
    }

    // 通知消息到login
    messageLogin(loginID, msgId, data) {
        log.debug("messageLogin loginID = %d, msgId = %d", loginID, msgId);
        log.debug(this.loginList)
        log.info(data)
        if (this.loginList[loginID]) {
            let conID = this.loginList[loginID].conID;
            this.connector.message(conID, msgId, data);
        }
    }

    // 广播到所有login
    broadcastToLogin(msgId, data) {
        for (const id in this.loginList) {
            let conID = this.loginList[id].conID;
            connector.message(conID, msgId, data);
        }
    }
}

const network = global.network || new Network();
module.exports = network;