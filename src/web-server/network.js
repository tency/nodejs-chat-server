'use strict';

const EventEmitter = require("events");
const Dispatcher = require("./dispatcher");
const WSClient = require("../common/ws-client");
const Config = require("../config");
const LoginReq = require("../common/login-req");

const log = logger.getLogger("Network");

// 连接chatServer
class Network extends EventEmitter {
    constructor() {
        super();
        log.debug("login network constructor");
        this.dispatcher = new Dispatcher();
        this.chatWS = null;
    }

    // 初始化ip和端口
    init(host, port) {

    }

    // 启动
    startup() {
        this.connectToChat(() => {
            log.info("web server connect chat server success.");
        });
    }

    // 停止
    shutdown() {
        log.debug("login Network shutdown");
        this.chatWS.disconnect();
    }

    // 连接到chatServer
    connectToChat(callback) {
        this.chatWS = new WSClient();
        const address = 'ws://' + Config.chatHost + ':' + Config.chatPort;
        this.chatWS.connect(address);

        this.chatWS.on("connected", () => {
            log.info('chat server connected.');

            // 发送一个登陆消息
            let loginData = {
                serverType: 'web',
            };
            this.requestChat(LoginReq.reqID, loginData, (code, resp) => {
                log.info('web server register to chat server suss');
                log.info(resp);
            });

            // 订阅消息
            this.dispatcher.subscribeMessage();
            callback && callback();
        });

        this.chatWS.on("disconnected", (code, reason) => {
            log.info('chat server disconnected. code = ' + code + ', reason = ' + reason);
        });
    }

    // 发送消息到world
    requestChat(reqID, data, callback) {
        if (this.chatWS) {
            this.chatWS.request(reqID, data, callback);
        } else {
            log.error("chatWS is null!");
        }
    }

    messageChat(msgID, data) {
        if (this.chatWS) {
            this.chatWS.message(msgID, data);
        } else {
            log.error("chatWS is null!");
        }
    }
}

let network = global.network || new Network();
module.exports = network;