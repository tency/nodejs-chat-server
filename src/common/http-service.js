const http = require('http');
const https = require('https');
const util = require('util');
const fs = require('fs');
var url = require('url');
var qs = require('querystring');
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
                // 解析请求，包括文件名
                var pathname = url.parse(req.url).pathname;
                log.debug("pathname = %s", pathname);

                res.writeHead(200, {
                    'Content-Type': 'application/json;charset=UTF-8'
                });

                // 响应文件内容
                if (pathname == "/getmember") {
                    let retData = {
                        "code": 0,
                        "msg": "",
                        "data": {
                            "list": [{
                                "username": "贤心",
                                "id": "100001",
                                "avatar": "//tva1.sinaimg.cn/crop.0.0.118.118.180/5db11ff4gw1e77d3nqrv8j203b03cweg.jpg",
                                "sign": "这些都是测试数据，实际使用请严格按照该格式返回"
                            }, {
                                "username": "Z_子晴",
                                "id": "108101",
                                "avatar": "//tva1.sinaimg.cn/crop.0.23.1242.1242.180/8693225ajw8fbimjimpjwj20yi0zs77l.jpg",
                                "sign": "微电商达人"
                            }]
                        }
                    }

                    res.write(JSON.stringify(retData));
                } else {
                    res.write("nothing to do");
                }
                //  发送响应数据
                res.end();
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