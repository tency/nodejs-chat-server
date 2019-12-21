'use strict';

global.logger = require("../src/common/logger");
logger.setupLog("dbconn test");

const DBConnectionMgr = require("../src/common/dbconnmgr");

const dbConMgr = new DBConnectionMgr();
dbConMgr.init("../src/schema", "../src/dbcfg/dbcfg")
    .then(() => {
        console.log('db init callback');
        let connectionName = "connection_1";
        const connection = dbConMgr.getConnection(connectionName);
        const userModel = connection.getModel("user");
        console.log(userModel);
    });