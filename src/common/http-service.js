const http = require('http');
const https = require('https');
const fs = require('fs');
const Config = require("../config");
const log = logger.getLogger("HttpService");

class HttpService {
    constructor() {

    }

    // 创建web服务器
    startup(serverName, port, ip, handler, onExit) {
        let getClientIp = function (req) {
            return req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                (req.connection.socket && req.connection.socket.remoteAddress) ||
                '';
        }

        var listener = function (req, res) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            res.setHeader("Access-Control-Allow-Credentials", "true");

            if (isExiting) {
                req.connection.destroy();
                return;
            }

            var body = '';
            req.on('data', function (chunk) {
                body += chunk;
                // POST请求不能超过100M
                if (body.length > 102400000) {
                    ERROR('REQUEST BODY TOO LARGE');
                    req.connection.destroy();
                    return;
                }
            });

            req.on('end', function () {
                res.writeHead(200, {
                    'Content-Type': 'application/json;charset=UTF-8'
                });

                handler(req, res, () => {
                    //  发送响应数据
                    res.end();
                })
            });
        };

        var isExiting = false;
        var server = null;
        if (!Config.useSSL) {
            server = http.createServer(listener);
        } else {
            server = https.createServer({
                key: fs.readFileSync('./key/server.key'),
                cert: fs.readFileSync('./key/server.crt'),
                ca: fs.readFileSync('./key/server.csr'),
            }, listener);
        }
        server.listen(port, ip);

        var pidFile = serverName + '.pid';
        process.on('SIGINT', beforExit);
        process.on('SIGTERM', beforExit);
        process.on('SIGHUP', beforExit);

        process.on('uncaughtException', function (err) {
            log.error(err.stack);

            if (err.code == 'EADDRINUSE') {
                beforExit();
            }
        });

        function beforExit() {
            log.info(serverName + ' begin shutdown');
            isExiting = true;

            if (onExit) {
                onExit(endExit);
            } else {
                endExit();
            }
        }

        function endExit() {
            fs.existsSync(pidFile) && fs.unlinkSync(pidFile);
            log.info(serverName + ' end shutdown');

            // delete this
            log.debug('end stopping : ' + (new Date()) / 1000);
            process.exit();
        }

        log.info(serverName + ' start');
        fs.writeFileSync(pidFile, process.pid, 'utf8');

        return server;
    }
}

let httpService = global.httpService || new HttpService();
module.exports = httpService;