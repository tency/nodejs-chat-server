'use strict';

const DBConnectionMgr = require("../common/dbconnmgr");
const log = logger.getLogger("dbmgr");

class DbMgr {
    constructor() {
        log.debug("db mgr constructor");

        this.dbConMgr = null;
        this.connection = null;
        this.userModel = null;
        this.groupModel = null;
    }

    init() {
        log.debug("db mgr init");

        let cfgUrl = "./dbcfg/dbcfg";
        this.dbConMgr = new DBConnectionMgr();
        this.dbConMgr.init("./schema", cfgUrl)
            .then(() => {
                log.info('db init callback');
                let connectionName = "connection_1";
                this.connection = this.dbConMgr.getConnection(connectionName);
                this.userModel = this.connection.getModel("user");
                this.groupModel = this.connection.getModel("group");
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

    getGroupModel() {
        return this.groupModel;
    }
}

let dbMgr = global.dbMgr || new DbMgr();
module.exports = dbMgr;