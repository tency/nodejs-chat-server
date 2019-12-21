const mongoose = require("mongoose");

// the name of schema must be Schema
const Schema = new mongoose.Schema({
    // 群id
    gid: {
        type: Number,
        unique: true
    },
    // 群名
    name: String,
    // 创建者uid
    createUid: Number,
    // 成员列表
    members: []
}, {
    timestamps: true
});

module.exports = Schema;