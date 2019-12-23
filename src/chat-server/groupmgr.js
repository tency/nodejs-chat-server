'use strict';

const log = logger.getLogger("groupmgr");
const ErrCode = require("../common/define").ErrCode;

class GroupMgr {
    constructor() {
        log.debug("group mgr constructor");
    }

    init() {
        log.debug("group mgr init");
    }

    handleGetMembers(conID, data, callback) {
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

        callback && callback(ErrCode.SUCCESS, retData);
    }
}

let groupMgr = global.groupMgr || new GroupMgr();
module.exports = groupMgr;