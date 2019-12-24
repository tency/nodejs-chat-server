'use strict';

const EventEmitter = require("events");
const WebSocket = require('ws');
const http = require("http");
const https = require("https");
const PingReq = require("../protocol/ping-req");
const Utility = require("./utility");
const NetStatusCode = require("./define").NetStatusCode;

const log = logger.getLogger("ws-server");

module.exports = class WSServer extends EventEmitter {
    constructor() {
        super();
        log.info("WSServer constructor");

        // 连接ID到连接的map
        this.id2ConMap = {};

        // 连接ID映射到一个对象，对象里是请求流水号sn到请求回调的map
        this.id2sn2cbMap = {};

        // 连接ID到PingState的map
        this.id2PingStateMap = {};
        this.wsServer = null;
        this.options = {};
        this.connections = [];
        this.snSeed = 0;
        this.idSeed = 0;
        this.conIDKey = "_con_id_key_";
        this.pingTimeout = 10000;
    }

    startup(options) {
        this.options = options;
        if (options.useSSL === true) {
            this.createSecureServer();
        } else {
            this.createServer();
        }
    }

    shutdown(cb) {
        this.wsServer.close(cb);
    }

    request(conID, reqID, data, cb) {
        const con = this.id2ConMap[conID];
        if (con === undefined) {
            return false;
        }

        // 判断是否为open状态
        if (con.readyState != 1) {
            return false;
        }

        const pkg = {
            reqID: reqID,
            reqSN: this.genReqSN(),
            data: data
        };
        this.addRequestCB(conID, pkg.reqSN, cb);
        con.send(JSON.stringify(pkg));
        return true;
    }

    message(conID, msgID, data) {
        const con = this.id2ConMap[conID];
        if (con === undefined) {
            return false;
        }
        const pkg = {
            msgID: msgID,
            data: data
        };
        con.send(JSON.stringify(pkg));
        return true;
    }

    broadcast(msgID, data) {
        for (const id in this.id2ConMap) {
            this.message(Number(id), msgID, data);
        }
    }

    disconnect(conID, code, reason) {
        const connection = this.id2ConMap[conID];
        if (connection) {
            connection.close(code, reason);
            log.debug(">>> connection close conid = %d", conID);
            return true;
        }
        return false;
    }

    createSecureServer() {
        const server = https.createServer({
            cert: fs.readFileSync(this.options.cert),
            key: fs.readFileSync(this.options.key),
        });
        this.wsServer = new WebSocket.Server({
            server
        });
        this.registerListeners();
        server.listen(this.options.listeningPort, this.options.listeningIP);
    }

    createServer() {
        const server = http.createServer();
        this.wsServer = new WebSocket.Server({
            server,
        });
        this.registerListeners();
        server.listen(this.options.listeningPort, this.options.listeningIP);
    }

    registerListeners() {
        this.wsServer.on("listening", this.onListening.bind(this));
        this.wsServer.on("error", this.onError.bind(this));
        this.wsServer.on("connection", this.onConnect.bind(this));
    }

    onListening() {
        log.info("ws server listening on %s:%d", this.options.listeningIP, this.options.listeningPort);
    }

    onError(error) {
        log.error(error);
    }

    onConnect(ws) {
        ws.on("message", (data) => {
            const pkg = JSON.parse(data);
            if (pkg.reqID != undefined) {
                this.emit(pkg.reqID, ws[this.conIDKey], pkg.data, this.genRequestCB(ws, pkg));
            } else if (pkg.msgID != undefined) {
                this.emit(pkg.msgID, ws[this.conIDKey], pkg.data);
            } else if (pkg.reqSN != undefined) {
                const cb = this.getRequestCB(ws[this.conIDKey], pkg.reqSN);
                if (cb) {
                    this.rmRequestCB(ws[this.conIDKey], pkg.reqSN);
                    cb(pkg.errCode, pkg.data);
                } else {
                    log.error("can not find callback of request, id = %s, sn = %s", pkg.reqID, pkg.reqSN);
                }
            } else {
                log.error("unknown package: ");
                log.error(pkg);
            }
        });

        ws.on("error", (err) => {
            log.error(err);
        });

        ws.on("close", (code, reason) => {
            const conID = ws[this.conIDKey];
            log.debug("ws.on close code = %d, connID = %d", code, conID);
            this.emit("disconnect", conID, code, reason);
            Utility.removeFromArray(this.connections, ws);
            delete this.id2ConMap[conID];
            this.clearPingState(conID);
            this.rmRequestCB(conID);
        });

        const conID = this.genConID();
        ws[this.conIDKey] = conID;
        this.id2ConMap[conID] = ws;
        this.connections.push(ws);
        this.ping(conID);
        this.emit("connection", conID);
    }

    genRequestCB(con, pkg) {
        const responseFunc = pkg.reqSN === undefined ? function () {} :
            function (errCode, responseData) {
                const response = {
                    reqSN: pkg.reqSN,
                    errCode: errCode,
                    data: responseData
                };
                con.send(JSON.stringify(response));
            };
        return responseFunc;
    }

    ping(conID) {
        const pingState = this.id2PingStateMap[conID] || {
            isWaitingForResponse: true,
            timerID: undefined
        };
        pingState.isWaitingForResponse = true;
        this.request(conID, PingReq.reqID, {}, (errCode, responseData) => {
            pingState.isWaitingForResponse = false;
            pingState.timerID = setTimeout(() => {
                if (pingState.isWaitingForResponse === true) {
                    this.disconnect(conID, NetStatusCode.HB_TIMEOUT, "heart time out");
                } else {
                    this.ping(conID);
                }
            }, this.pingTimeout);
        });
        this.id2PingStateMap[conID] = pingState;
    }

    clearPingState(conID) {
        const pingState = this.id2PingStateMap[conID];
        if (pingState) {
            clearTimeout(pingState.timerID);
            delete this.id2PingStateMap[conID];
        }
    }

    genReqSN() {
        return ++this.snSeed;
    }

    genConID() {
        return ++this.idSeed;
    }

    addRequestCB(conID, sn, cb) {
        const sn2cbMap = this.id2sn2cbMap[conID] || {};
        sn2cbMap[sn] = cb;
        this.id2sn2cbMap[conID] = sn2cbMap;
    }

    getRequestCB(conID, sn) {
        const sn2cbMap = this.id2sn2cbMap[conID];
        if (sn2cbMap) {
            return sn2cbMap[sn];
        }
        return undefined;
    }

    rmRequestCB(conID, sn) {
        if (sn === undefined) {
            delete this.id2sn2cbMap[conID];
        } else {
            const sn2cbMap = this.id2sn2cbMap[conID];
            if (sn2cbMap) {
                delete sn2cbMap[sn];
            }
        }
    }
}