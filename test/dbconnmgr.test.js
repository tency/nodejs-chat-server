'use strict';

global.logger = require("../src/common/logger");
logger.setupLog("dbconn test");

const DBConnectionMgr = require("../src/common/dbconnmgr");

describe("DBConnectionMgr.init", () => {
    it("should resolved", () => {
        const dbConnMgr = new DBConnectionMgr();
        return expect(
            dbConnMgr.init("./src/schema", "./src/dbcfg/dbcfg")
            .then(() => {
                expect(dbConnMgr.getConnection("connection_1")).not.toBeNull();
                dbConnMgr.disconnectAll();
            })
        ).resolves.toBeUndefined();
    });
});