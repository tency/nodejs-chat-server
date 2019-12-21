const mongoose = require("mongoose");

// the name of schema must be Schema
const Schema = new mongoose.Schema({
    uid: {
        type: Number,
        unique: true
    },
    openid: String,
    regTime: Number, // 注册时间
    loginTime: Number, // 上次登录时间
    loginIp: String, // 上次登录ip

    nick: String, // 昵称
    gender: String, // 性别
    avatar: String, // 头像

    // 好友列表,uid
    friends: []
}, {
    timestamps: true
});

module.exports = Schema;