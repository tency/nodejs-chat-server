'use strict';

const debug = require("debug");
const winston = require("winston");
const format = winston.format;
const moment = require("moment");

class Logger {
    constructor(name) {
        this.debugLogger = null;;
        this.logFileName = "log";
    }

    setLevel(level) {
        winston.default.level = level;
    }

    silly(format, ...args) {
        //args.unshift('silly', format);
        //this.debugLogger.apply(this, args);
        winston.warn('silly', format, args);
    }

    debug(format, ...args) {
        //args.unshift('debug', format);
        //this.debugLogger.apply(this, args);
        winston.warn('debug', format, args);
    }

    verbose(format, ...args) {
        //args.unshift('verbose', format);
        //this.debugLogger.apply(this, args);
        winston.warn('verbose', format, args);
    }

    info(format, ...args) {
        //args.unshift('info', format);
        //this.debugLogger.apply(this, args);
        winston.log('info', format, args);
    }

    warn(format, ...args) {
        //args.unshift('warn', format);
        //this.debugLogger.apply(this, args);
        winston.warn('warn', format, args);
    }

    error(format, ...args) {
        //args.unshift('error', format);
        //this.debugLogger.apply(this, args);
        winston.error('error', format, args);
    }

    setupLog(name, level) {
        this.logFileName = name;
        //this.configDebug(name);
        this.configWinston();
    }

    configDebug(name) {
        debug["formatArgs"] = () => {};
        this.debugLogger = debug(name);
        this.debugLogger.log = this.winstonLog;
    }

    getLogger() {
        return this;
    }

    configWinston() {
        winston.configure({
            format: format.combine(
                format.splat(),
                format.simple(),
            ),
            transports: [
                new(winston.transports.Console)({
                    timestamp: function () {
                        return moment().format('YYYY-MM-DD HH:mm:ss')
                    },
                }),
                new(winston.transports.File)({
                    filename: './logs/' + this.logFileName + '.log', //项目根目录
                    maxsize: 1024 * 1024 * 50, //50M
                    timestamp: function () {
                        return moment().format('YYYY-MM-DD HH:mm:ss')
                    },
                    json: true
                })
            ]
        });
    }

    winstonLog() {
        winston.log.apply(winston, arguments);
    }
}

let logger = global.logger || new Logger();
module.exports = logger;