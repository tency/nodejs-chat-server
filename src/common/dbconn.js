'use strict';

const mongoose = require("mongoose");
const SchemaMgr = require("./schemamgr");
const Config = require("../config");

const createConnection = mongoose.createConnection;
const log = logger.getLogger("DBConnection");

module.exports = class DBConnection {
    constructor(cfg, mgr) {
        this.conCfg = cfg;
        this.schemaMgr = mgr;
        this.connection = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            let dbName = Config.mongodbNamePrefix + Config.serverId;
            let url = "mongodb://" + Config.mongodbHost + ":" + Config.mongodbPort + "/" + dbName;
            log.info('db url = %s', url)

            this.connection = createConnection(url, this.conCfg.options);
            this.connection.once("connected", () => {
                resolve();
            });
            this.connection.once("error", (error) => {
                reject();
            });
            this.connection.on("connecting", this.onConnecting.bind(this));
            this.connection.on("connected", this.onConnected.bind(this));
            this.connection.on("disconnecting", this.onDisconnecting.bind(this));
            this.connection.on("disconnected", this.onDisconnected.bind(this));
            this.connection.on("error", this.onError.bind(this));
        });
    }

    close() {
        return this.connection.close();
    }

    onConnecting() {
        log.info("### dbconn %s connecting.", this.conCfg.connectionID);
    }

    onConnected() {
        log.info("### dbconn %s onConnected.", this.conCfg.connectionID);
    }

    onDisconnecting() {
        log.warn("### dbconn %s onDisconnecting.", this.conCfg.connectionID);
    }

    onDisconnected() {
        log.warn("### dbconn %s onDisconnected.", this.conCfg.connectionID);
    }

    onError(error) {
        log.error("### dbconn %s onError.", this.conCfg.connectionID);
        log.error(error);
    }

    getModel(name) {
        console.log("getModel " + name)
        console.log(this.schemaMgr.getSchema(name))
        return this.connection.model(name, this.schemaMgr.getSchema(name));
    }
}