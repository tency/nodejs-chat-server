const SchemaMgr = require("../src/common/schemamgr");

const schemaMgr = new SchemaMgr();
schemaMgr.loadAllSchema("../src/schema");
const userSchema = schemaMgr.getSchema("user");
console.log(userSchema);