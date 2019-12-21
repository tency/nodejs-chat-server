'use strict';

const redis = require("redis");
const config = require("../config");
const log = logger.getLogger("cachemgr");

class CacheMgr {
    constructor() {
        this.cache = null;
    }

    init() {
        this.connectRedis((cache) => {
            this.cache = cache;
            log.info("redis connect");
        });
    }

    connectRedis(callback) {
        var client = redis.createClient(config.redisPort, config.redisHost);
        client.auth(config.redisAuth || '');
        client.select(config.redisId, function (err) {
            if (err) {
                log.error(err);
                process.exit(-1);
            }
        });

        client.on('ready', function () {
            callback && callback(client);
        });

        client.on('error', function (e) {
            log.error(e);
        });
    }
}

let cacheMgr = global.cacheMgr || new CacheMgr();
module.exports = cacheMgr;