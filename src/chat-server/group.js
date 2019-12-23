'use strict';

const log = logger.getLogger("group");
const ErrCode = require("../common/define").ErrCode;
const Utility = require("../common/utility");

module.exports = class Group {
    constructor() {
        log.debug("group constructor");
        this.groupData = {}; // 群的基础信息
        this.members = [];
        this.dirty = false;
        this.lastSaveTime = 0; // 上一次保存时间，为了控制保存的频率

        this.chatLog = []; // 该群组的聊天记录
    }

    init(data) {
        this.groupData = data;
        this.buildMembers();
        this.lastSaveTime = Utility.getTime();
    }

    getGroupData() {
        return this.groupData;
    }

    getMembers() {
        return this.members;
    }

    getChatLog() {
        return this.chatLog;
    }

    // 添加聊天记录
    addChatLog(chat) {
        this.chatLog.push(chat);

        // 只保留最新50条
        if (this.chatLog.length > 50) {
            this.chatLog.splice(0, 1);
        }
    }

    // 添加成员
    addMember(id, callback) {
        if (this.hasMember(id)) {
            callback && callback(ErrCode.FAILED);
            return;
        }

        this.groupData.members.push(id);
        this.setDirty();
        this.addMemberInfo(id, (member) => {
            callback && callback(member);
        });
    }

    // 是否包含指定成员
    hasMember(id) {
        return this.groupData.members.indexOf(id) >= 0;
    }

    // 移除成员
    removeMember(id) {
        let index = this.groupData.members.indexOf(id)
        if (index >= 0) {
            this.groupData.members.splice(index, 1);
            this.setDirty();
            this.removeMemberInfo(id);
        }
    }

    addMemberInfo(id, callback) {
        let user = userMgr.getUser(id);
        if (user) {
            let newMember = {
                id: user.getId(),
                username: user.getNick(),
                avatar: user.getAvatar(),
                sign: user.getSign(),
            }
            this.members.push(newMember);
            if (this.members.length == this.groupData.members.length) {
                callback && callback(newMember);
            }
        } else {
            // 不在线，从数据库查找
            dbMgr.getUserModel().find({
                id: id
            }).then((users) => {
                let userData = users[0];
                if (userData) {
                    let newMember = {
                        id: userData.id,
                        username: userData.username,
                        avatar: userData.avatar,
                        sign: userData.sign,
                    }
                    this.members.push(newMember);
                    if (this.members.length == this.groupData.members.length) {
                        callback && callback(newMember);
                    }
                }
            });
        }
    }

    removeMemberInfo(id) {
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i].id == id) {
                this.members.splice(i, 1);
                break;
            }
        }
    }

    // 构建成员信息
    buildMembers(callback) {
        for (let i = 0; i < this.groupData.members.length; i++) {
            this.addMemberInfo(parseInt(this.groupData.members[i]), callback);
        }
    }

    onCreate() {
        log.debug("on group create, id = ", this.groupData.id);
    }

    onRemove() {
        log.debug("on group remove, id = ", this.groupData.id);
    }

    setDirty() {
        this.dirty = true;
    }

    // force 是否强制保存，不等时间间隔
    save(force, callback) {
        // 控制保存间隔
        if (!force && Utility.getTime() - this.lastSaveTime < 10) {
            return;
        }

        if (this.dirty) {
            dbMgr.getGroupModel().find({
                    id: this.groupData.id
                })
                .then(groups => {
                    let group = groups[0];

                    group.set('avatar', this.groupData.avatar);
                    group.set('members', this.groupData.members);
                    group.set("groupname", this.groupData.groupname);
                    group.save(null, callback);
                    log.debug("save group");
                });
        }
    }

    onTick() {
        this.save(false, () => {
            this.dirty = false;
            this.lastSaveTime = Utility.getTime();
        })
    }
}