'use strict';

const EventEmitter = require("events");
const Connector = require("../common/connector");
const Dispatcher = require("./dispatcher");
const WSClient = require("../common/ws-client");
const Config = require("../config");
const LoginReq = require("../common/login-req");

const log = logger.getLogger("Network");

// login服务器监听客户端连接，并去连接chatServer
class Network extends EventEmitter {
    constructor() {
        super();
        log.debug("login network constructor");
        this.connector = new Connector();
        this.dispatcher = new Dispatcher();
        this.chatWS = null;
        this.loginID = 0;
    }

    // 初始化ip和端口
    init(host, port) {
        this.connector.host = host;
        this.connector.port = port;
    }

    setLoginID(id) {
        this.loginID = id;
    }

    getLoginID() {
        return this.loginID;
    }

    // 启动
    startup() {
        // 启动监听
        this.connector.startup();

        // 监听客户端连接
        this.connector.on("register_client", (conID, loginID, loginIp, loginPort) => {
            log.info("login server register conID = " + conID + ", loginID = " + loginID + ", ip = " + loginIp + ", port = " + loginPort);

            this.loginList[gateID] = {
                conID: conID,
                serverID: loginID,
                serverIP: loginIp,
                serverPort: loginPort
            }
        });

        // 监听客户端移除
        this.connector.on("remove_login", (conID) => {
            log.info("remove login conID = " + conID);
        });


        this.connectToChat(() => {
            log.info("network startup at %s:%d", this.connector.host, this.connector.port);
        });
    }

    // 停止
    shutdown() {
        log.debug("login Network shutdown");
        this.connector.shutdown();
        this.connector = null;
    }

    // 连接到chatServer
    connectToChat(callback) {
        this.chatWS = new WSClient();
        const address = 'ws://' + Config.chatHost + ':' + Config.chatPort;
        this.chatWS.connect(address);

        this.chatWS.on("connected", () => {
            log.info('chat server connected.');

            var _serverId = parseInt(process.argv[process.argv.length - 1]);
            log.debug('login id = ' + _serverId);

            // 发送一个登陆消息
            let loginData = {
                serverType: 'login',
                serverId: _serverId,
                serverIp: Config.loginHost,
                serverPort: Config.loginPort + _serverId
            };
            this.requestChat(LoginReq.reqID, loginData, (code, resp) => {
                log.info('login server register to chat server suss');
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
        }
    }

    messageChat(msgID, data) {
        if (this.chatWS) {
            this.chatWS.message(msgID, data);
        }
    }
}

let network = global.network || new Network();
module.exports = network;