'use strict';

const log = logger.getLogger("groupmgr");
const ErrCode = require("../common/define").ErrCode;
const Group = require("./group");

class GroupMgr {
    constructor() {
        log.debug("group mgr constructor");
        this.groupList = {};
    }

    init() {
        log.debug("group mgr init");

        const self = this;
        // 加载所有群
        dbMgr.getGroupModel().find({})
            .then((groups) => {
                for (let i = 0; i < groups.length; i++) {
                    let groupData = groups[i];
                    if (groupData) {
                        this.loadGroup(groupData);
                    }
                }

                self.onGroupLoadFinish();
            });
    }

    // 群组加载完成回调
    onGroupLoadFinish() {
        if (Object.keys(this.groupList).length == 0) {
            // 没有任何群，默认构造一个系统群聊
            let initData = {
                id: 1,
                groupname: "系统聊天室",
                createUid: 0,
                avatar: "http://www.tap2joy.com/chat/static/img/group_icon.jpg",
                members: []
            }
            this.createGroup(initData);
        }
    }

    getGroupList() {
        let retData = [];
        for (let id in this.groupList) {
            retData.push(this.groupList[id].getGroupData());
        }

        return retData;
    }

    onTick() {
        for (let id in this.groupList) {
            this.groupList[id].onTick();
        }
    }

    getGroup(id) {
        return this.groupList[id];
    }

    createGroup(groupData) {
        if (this.hasGroup(groupData.id)) {
            return;
        }

        dbMgr.getGroupModel().create(groupData)
            .then(() => {
                let newGroup = new Group();
                newGroup.init(groupData);
                newGroup.onCreate();
                this.groupList[groupData.id] = newGroup;
            });
    }

    loadGroup(groupData) {
        if (this.hasGroup(groupData.id)) {
            return;
        }

        let newGroup = new Group();
        newGroup.init(groupData);
        newGroup.onCreate();
        this.groupList[groupData.id] = newGroup;
    }

    hasGroup(id) {
        return Object.keys(this.groupList).indexOf(id) >= 0;
    }

    removeGroup(id) {
        if (this.groupList[id]) {
            this.groupList[id].onRemove();
            delete this.groupList[id];
        }
    }

    handleGetMembers(conID, data, callback) {
        let retData = {
            "code": 0,
            "msg": "ok",
            "data": {}
        }

        const groupid = data.id;
        const group = this.getGroup(groupid);
        if (group) {
            retData.data.list = group.getMembers();
        } else {
            retData.msg = "group not exist, id = " + groupid;
            retData.data.list = [];
        }

        callback && callback(ErrCode.SUCCESS, retData);
    }

    addMember(gid, uid) {
        let group = this.getGroup(gid);
        if (group) {
            group.addMember(uid, () => {

            });
        }
    }
}

let groupMgr = global.groupMgr || new GroupMgr();
module.exports = groupMgr;