const mongoDbCfgArray = [{
    connectionID: "connection_1",
    // connection string doc: https://docs.mongodb.com/manual/reference/connection-string/
    url: "mongodb://localhost:27017/chat_server_100",
    // option doc: http://mongodb.github.io/node-mongodb-native/2.2/api/MongoClient.html
    options: {
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 500,
        bufferCommands: true,
        poolSize: 10,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
}];

module.exports = mongoDbCfgArray;