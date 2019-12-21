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
    // client 2 login
    W2G_REGISTER_GAME: '10001',
    W2G_REMOVE_GAME: '10002',

    // client to gateway
    C2G_REGISTER_CLIENT: '20001',
    C2G_LOGIN: '20002',
}