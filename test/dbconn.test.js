'use strict';

global.logger = require("../src/common/logger");
logger.setupLog("dbconn test");

const DBConnectionMgr = require("../src/common/dbconnmgr");
const DBConnection = require("../src/common/dbconn");
const mongoDbCfgArray = require("../src/dbcfg/dbcfg");
const SchemaMgr = require("../src/common/schemamgr");

describe("DBConnection.connect", () => {
    it("should resolved", () => {
        const schemaMgr = new SchemaMgr();
        expect(schemaMgr.loadAllSchema("./src/schema")).toBe(true);
        const connection = new DBConnection(mongoDbCfgArray[0], schemaMgr);
        return expect(
            connection.connect().then(() => {
                expect(connection.getModel("user")).not.toBeNull();
                return connection.close();
            })
        ).resolves.toBeUndefined();
    });
});