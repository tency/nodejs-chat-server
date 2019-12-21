'use strict';

const log = logger.getLogger("chatmgr");

class ChatMgr {
    constructor() {

    }

    init() {

    }
}

let chatMgr = global.chatMgr || new ChatMgr();
module.exports = chatMgr;