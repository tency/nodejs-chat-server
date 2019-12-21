'use strict';

const DBConnection = require("./dbconn");
const SchemaMgr = require("./schemamgr");
const mongoose = require("mongoose");
const async = require("async");
const process = require("process");
const path = require("path");

const log = logger.getLogger("DBConnection");

module.exports = class DBConnectionMgr {
    constructor() {
        this.configArray = {};
        this.schemaMgr = null;
        this.connections = {};
    }

    init(schemaPath, cfgPath) {
        return new Promise((resolve, reject) => {
            if (!this.loadConfig(cfgPath)) {
                return reject(new Error("### load cfg error, " + cfgPath));
            }
            this.schemaMgr = new SchemaMgr();
            if (!this.schemaMgr.loadAllSchema(schemaPath)) {
                return reject(new Error("### load all schema failed, " + schemaPath));
            }

            async.each(
                this.configArray,
                (cfg, callback) => {
                    const connection = new DBConnection(cfg, this.schemaMgr);
                    connection.connect()
                        .then(() => {
                            callback();
                        })
                        .catch((err) => {
                            callback(err);
                        });
                    this.connections[cfg.connectionID] = connection;
                },
                (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                }
            );
        });
    }

    getConnection(id) {
        return this.connections[id];
    }

    disconnectAll() {
        this.connections = {};
        return mongoose.disconnect();
    }

    loadConfig(filename) {
        this.configArray = require(path.join(process.cwd(), filename));
        return (this.configArray != undefined);
    }
}