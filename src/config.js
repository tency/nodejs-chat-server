exports.serverId = 100;

// login可以开多个
exports.loginHost = '0.0.0.0';
exports.loginPort = 41000;
exports.loginCount = 2;
exports.loginIdBegin = 1;

// chat只开一个
exports.chatHost = '127.0.0.1';
exports.chatPort = 41999;

// 数据库配置
exports.mongodbHost = '127.0.0.1'; // mongodb地址
exports.mongodbPort = 27017; // mongodb端口
exports.mongodbNamePrefix = 'dev_server_'; // 所用到的数据库名前缀

exports.redisHost = '127.0.0.1'; // redies地址
exports.redisPort = 6379; // redies端口
exports.redisId = 0;

exports.PHPHost = '127.0.0.1'; // web服地址
exports.PHPPort = 80; // web服端口
exports.PHPPath = '/req_from_node.php';