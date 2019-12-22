'use strict';

const Config = require("../config");
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const log = logger.getLogger("dbmgr");

class DbMgr {
    constructor() {
        this.dbPlat = null;
        this.client = null;
        this.db = null;
    }

    init() {
        return new Promise((resolve, reject) => {
            var index = parseInt(process.argv[process.argv.length - 1]);
            let dbIndex = Config.serverId + index;
            let dbName = Config.mongodbNamePrefix + dbIndex;
            let url = "mongodb://" + Config.mongodbHost + ":" + Config.mongodbPort + "/" + dbName;

            this.connect(url, dbName, () => {
                log.info('login db connect');

                // 如果还没有数据，就插入一条
                this.dbPlat.countDocuments({})
                    .then((count) => {
                        if (count <= 0) {
                            this.dbPlat.insertOne({
                                _id: '_userid',
                                'ai': Config.serverId * index * 1000000
                            });
                        }

                        resolve();
                    })
            });
        });
    };

    disconnect() {

    }

    connect(url, dbName, callback) {
        return MongoClient.connect(url, {
                poolSize: 10,
                reconnectTries: Number.MAX_VALUE,
                reconnectInterval: 500,
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            .then((instant) => {
                this.client = instant;
                this.db = this.client.db(dbName);
                this.dbPlat = this.db.collection('plat');
                callback();
            })
            .catch((err) => {
                callback(err);
            });
    }

    getDbPlat() {
        return this.dbPlat;
    }
}

let dbMgr = global.dbMgr || new DbMgr();
module.exports = dbMgr;