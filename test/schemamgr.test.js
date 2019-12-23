const SchemaMgr = require("../src/common/schemamgr");

describe("SchemaMgr.loadAllSchema", () => {
    it("should return true", () => {
        const schemaMgr = new SchemaMgr();
        expect(schemaMgr.loadAllSchema("./src/schema")).toBe(true);
        expect(schemaMgr.getSchema("user")).not.toBeNull();
    });
});