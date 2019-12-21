'use strict';

// 封装一个connetor用于自动关闭超时不登录的连接、处理登录请求
class Connector extends WSServer {
    constructor() {
        this.loginTimeout = 5000; // 等待认证的时长，超过这个时间没有认证直接关闭连接
        this.id2timerMap = {};

        this._host = '';
        this._port = 0;
    }

    startup() {
        super.startup({
            listeningIP: this.host,
            listeningPort: this.port
        });
        this.on(LoginReq.reqID, this.onLoginReq.bind(this));
        this.on("connection", this.onConnection.bind(this));
        this.on("disconnect", this.onDisconnect.bind(this));
    }

    get host() {
        return this._host;
    }

    set host(address) {
        this._host = address;
    }

    get port() {
        return this._port;
    }

    set port(listenPort) {
        this._port = listenPort;
    }

    onLoginReq(conID, request, cb) {
        // TODO: login
        log.info(request);
        const response = {
            isLogin: true,
            userID: Date.now().toString()
        };
        if (response.isLogin) {
            this.clearLoginTimer(conID, "logon");

            // 注册game
            if (request.serverType == "game") {
                this.emit("register_game", conID, request.serverId, request.serverIp, request.serverPort);
            }

            // 注册gateway
            if (request.serverType == "gateway") {
                this.emit("register_gate", conID, request.serverId, request.serverIp, request.serverPort);
            }

            // 注册db
            if (request.serverType == "db") {
                this.emit("register_db", conID, request.serverId, request.serverIp, request.serverPort);
            }

            // 注册client
            if (request.serverType == "client") {
                this.emit("register_client", conID, request.serverIp, request.serverPort);
            }
        }
        cb(ErrCode.SUCCESS, response);
    }

    onConnection(conID) {
        log.info("connector onConnection conID = %d", conID);
        this.setLoginTimer(conID);
    }

    onDisconnect(conID, code, reason) {
        log.debug("on disconnect, conID = %d, code = %d, reason = %s", conID, code, reason);
        this.clearLoginTimer(conID, "on disconnect");

        this.emit("remove_client", conID);
    }

    setLoginTimer(conID) {
        this.id2timerMap[conID] = setTimeout(() => {
            log.debug("connection %d login timeout", conID);
            this.disconnect(conID, NetStatusCode.LOGIN_TIMEOUT, NetStatusCode[NetStatusCode.LOGIN_TIMEOUT]);
        }, this.loginTimeout);
    }

    clearLoginTimer(conID, reason) {
        log.debug("Connector clearLoginTimer, reason = %s", reason);
        clearTimeout(this.id2timerMap[conID]);
        delete this.id2timerMap[conID];
    }
}