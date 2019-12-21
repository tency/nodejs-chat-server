const log = logger.getLogger("server");

module.exports = class Server {
    constructor() {
        log.debug("base server constructor");
    }

    startup() {
        log.debug("base server startup");
    }
}