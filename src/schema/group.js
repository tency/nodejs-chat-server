const mongoose = require("mongoose");

// the name of schema must be Schema
const Schema = new mongoose.Schema({
    // 群id
    id: {
        type: Number,
        unique: true
    },
    // 群名
    groupname: String,
    // 群组头像
    avatar: String,
    // 创建者uid
    createUid: Number,
    // 成员列表
    members: []
}, {
    timestamps: true
});

module.exports = Schema;