const log = logger.getLogger("SystemMgr");
const ErrCode = require("../common/define").ErrCode;
const MSG_ID = require("../common/define").MSG_ID;
const url = require('url');

class LogicHandler {
    constructor() {

    }

    handleMessage(req, res, callback) {
        // 解析请求，包括文件名
        var pathname = url.parse(req.url).pathname;
        log.debug("pathname = %s", pathname);

        if (pathname == "/getmember") {
            // 获取聊天室成员列表
            this.getMemberList(1, (err, data) => {
                res.write(JSON.stringify(data));
                callback && callback();
            });
        } else {
            res.write("nothing to do");
            callback && callback();
        }
    }

    // 请求聊天室成员列表
    getMemberList(id, callback) {
        const reqData = {
            id: id
        }
        network.requestChat(MSG_ID.W2CS_GET_GROUP_MEMBERS, reqData, (err, data) => {
            log.debug("receive group members");
            log.debug(data);
            callback && callback(err, data)
        });
    }
}

let logicHandler = global.logicHandler || new LogicHandler();
module.exports = logicHandler;