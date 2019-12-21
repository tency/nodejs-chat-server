'use strict';

const DBConnectionMgr = require("../common/dbconnmgr");
const log = logger.getLogger("dbmgr");

class DbMgr {
    constructor() {
        log.debug("db mgr constructor");

        this.dbConMgr = null;
        this.connection = null;
        this.userModel = null;
    }

    init() {
        log.debug("db mgr init");

        let cfgUrl = "./src/dbcfg/dbcfg";
        this.dbConMgr = new DBConnectionMgr();
        this.dbConMgr.init("./src/schema", cfgUrl)
            .then(() => {
                log.info('db init callback');
                let connectionName = "connection_1";
                this.connection = this.dbConMgr.getConnection(connectionName);
                this.userModel = this.connection.getModel("user");
            });
    }

    disconnect() {
        if (this.dbConMgr) {
            this.dbConMgr.disconnectAll();
            this.dbConMgr = null;
        }
    }

    getUserModel() {
        return this.userModel;
    }
}

let dbMgr = global.dbMgr || new DbMgr();
module.exports = dbMgr;