const logger = require("../src/common/logger");

logger.setupLog('server');
log = logger.getLogger("test");

log.debug("debug log %s", 1);
log.info("info log %s", 1);
log.warn("warn log %s", 1);
log.error("error log %s, %d", "hello", 3);

console.log(process.execPath)
console.log(__dirname)
console.log(process.cwd())