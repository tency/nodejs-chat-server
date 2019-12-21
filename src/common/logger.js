const log4js = require("log4js");
const path = require("path");

// 简单的封装下log4js
class Logger {
    constructor() {
        this.logFileName = "test";
    }

    configure() {
        const fullpath = path.join(process.cwd(), './logs/', this.logFileName);
        log4js.configure({
            appenders: {
                out: {
                    type: 'console'
                },
                log_file: {
                    type: "dateFile",
                    filename: fullpath,
                    pattern: "yyyy-MM-dd.log",
                    alwaysIncludePattern: true,
                },
            },
            categories: {
                default: {
                    appenders: ["out", "log_file"],
                    level: "debug"
                }
            }
        });
    }

    getLogger(name) {
        return log4js.getLogger(name);
    }

    setupLog(name) {
        if (name) {
            this.logFileName = name;
        }
        this.configure();
    }
}

let logger = global.logger || new Logger();
module.exports = logger;