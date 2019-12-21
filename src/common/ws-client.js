'use strict';

const EventEmitter = require("events");
const WebSocket = require('websocket');

module.exports = class WSClient extends EventEmitter {
    constructor() {
        this.sn2cbMap = {};

        this.address = "";
        this.ws = null;
        this.snSeed = 0;
    }

    connect(address) {
        this.address = address;
        this.ws = new WebSocket(address);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onerror = this.onError.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
    }

    disconnect(code, reason) {
        log.info(`active disconnect from ${this.address}`);
        this.sn2cbMap = {};
        this.ws.close(code, reason);
    }

    request(reqID, data, cb) {
        const pkg = {
            reqID: reqID,
            reqSN: this.genReqSN(),
            data: data
        };
        this.addRequestCB(pkg.reqSN, cb);
        this.ws.send(JSON.stringify(pkg));
    }

    message(msgID, data) {
        const pkg = {
            msgID: msgID,
            data: data
        };
        this.ws.send(JSON.stringify(pkg));
    }

    onOpen(ev) {
        log.info(`on open connected to ${this.address}`);
        this.emit("connected");
        this.on(PingReq.reqID, this.onPingReq.bind(this));
    }

    onPingReq(data, cb) {
        const response = {};
        cb(ErrCode.SUCCESS, response);
    }

    onClose(ev) {
        log.info(`disconnected from ${this.address}, code = ${ev.code}, reason = ${ev.reason}`);
        this.emit("disconnected", ev.code, ev.reason);
    }

    onError(ev) {
        log.error(`error on connection of ${this.address}`);
    }

    onMessage(ev) {
        const pkg = JSON.parse(ev.data);
        if (pkg.reqID != undefined) {
            this.emit(pkg.reqID, pkg.data, this.genRequestCB(pkg));
        } else if (pkg.msgID != undefined) {
            this.emit(pkg.msgID, pkg.data);
        } else if (pkg.reqSN != undefined) {
            const cb = this.getRequestCB(pkg.reqSN);
            if (cb) {
                this.rmRequestCB(pkg.reqSN);
                cb(pkg.errCode, pkg.data);
            } else {
                log.error(`can not find callback of request, id = ${pkg.reqID}, sn = ${pkg.reqSN}`);
            }
        } else {
            log.error("unknown package: ", pkg);
        }
    }

    genRequestCB(pkg) {
        const self = this;
        const responseFunc = pkg.reqSN === undefined ? function () {} :
            function (errCode, responseData) {
                const response = {
                    reqSN: pkg.reqSN,
                    errCode: errCode,
                    data: responseData
                };
                self.ws.send(JSON.stringify(response));
            };
        return responseFunc;
    }

    addRequestCB(sn, cb) {
        if (this.sn2cbMap[sn] != undefined) {
            log.error(`WSClient.addRequestCB error, sn ${sn} already added, the cb is ${cb === this.sn2cbMap[sn] ? "the same one" : "not the same one."}`);
            return;
        }
        this.sn2cbMap[sn] = cb;
    }

    getRequestCB(sn) {
        return this.sn2cbMap[sn];
    }

    rmRequestCB(sn) {
        if (sn === undefined) {
            this.sn2cbMap = {};
            return;
        }
        delete this.sn2cbMap[sn];
    }

    genReqSN() {
        return ++this.snSeed;
    }


}