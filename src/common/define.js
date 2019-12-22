// 基础错误码定义
exports.ErrCode = {
    SUCCESS: 1, // 成功
    FAILED: 2, // 失败
    PASSWORDERROR: 3, // 密码错误
    UNKNOWN: 4, // 未知错误
}

// 网络状态码，值域[3000, 5000)
exports.NetStatusCode = {
    HB_TIMEOUT: 3000, // 心跳包超时
    LOGIN_TIMEOUT: 3001, // 登录超时
}

// 消息id定义
exports.MSG_ID = {
    // client to login server
    C2L_USER_LOGIN: '10001', // 登录
    C2L_USER_LOGOUT: '10002', //登出
    C2L_MODIFY_SIGN: "10003", // 修改签名
    C2L_MODIFY_AVATAR: "10004", // 修改头像
    C2L_MODIFY_NICK: "10005", // 修改昵称
    C2L_ADD_FRIEND: "10006", // 添加好友

    // login server to client
    L2C_ADD_FRIEND: "20001", // 添加好友通知

    // login server to chat server
    L2CS_USER_CREATE: "30001",
    L2CS_USER_GET: "30002",
    L2CS_USER_LOGOUT: "30003",
    L2CS_MODIFY_SIGN: "30004", // 修改签名
    L2CS_MODIFY_AVATAR: "30005", // 修改头像
    L2CS_MODIFY_NICK: "30006", // 修改昵称
    L2CS_ADD_FRIEND: "30007", // 添加好友

    // chat server to login server
    CS2L_ADD_FRIEND: "40001", // 添加好友通知
}