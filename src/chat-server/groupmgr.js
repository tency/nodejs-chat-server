'use strict';

const log = logger.getLogger("groupmgr");

class GroupMgr {
    constructor() {
        log.debug("group mgr constructor");
    }

    init() {
        log.debug("group mgr init");
    }
}

let groupMgr = global.groupMgr || new GroupMgr();
module.exports = groupMgr;