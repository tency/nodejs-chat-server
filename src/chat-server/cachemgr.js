'use strict';

const redis = require("redis");
const config = require("../config");
const log = logger.getLogger("cachemgr");
const Utility = require("../common/utility");
const ErrCode = require("../common/define").ErrCode;

class CacheMgr {
    constructor() {
        this.cache = null;

        // 存储受欢迎的词，按最近5秒内使用次数从大到小排序
        this.popularWords = [ /*word:"", [time,]*/ ];

        // 存储每个单词在popularWords中的位置
        this.wordIndex = {};

        // 上次排序时间
        this.lastSortTime = Utility.getTime();
    }

    init() {
        return new Promise((resolve, reject) => {
            this.connectRedis((cache) => {
                this.cache = cache;
                log.info("redis connect...");
                resolve();
            });
        });
    }

    onTick(curTime) {
        // 删除过期的词,1秒一次
        for (let i = 0; i < this.popularWords.length; i++) {
            for (let j = 0; j < this.popularWords[i].times.length; j++) {
                if (curTime >= this.popularWords[i].times[j]) {
                    this.popularWords[i].times.splice(j, 1);
                    j--;
                } else {
                    // 越后面的时间越大，就不用比较了
                    break;
                }
            }

            if (this.popularWords[i].times.length == 0) {
                delete this.wordIndex[this.popularWords[i].word];
                this.popularWords.splice(i, 1);
                i--;
            }
        }

        // 10秒排一次序
        if (curTime > this.lastSortTime + 10) {
            this.popularWords.sort((a, b) => {
                return a.times.length - b.times.length;
            });
            this.lastSortTime = curTime;
        }
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

    addPopularWord(word) {
        const timeout = Utility.getTime() + 5;
        if (this.wordIndex[word]) {
            // 已经在队列中，更新时间
            let index = this.wordIndex[word];
            this.popularWords[index].times.push(timeout);
        } else {
            // 新加入的，放最后
            this.popularWords.push({
                word: word,
                times: [timeout]
            });
            this.wordIndex[word] = this.popularWords.length - 1;
        }
    }

    getMostPopularWord() {
        if (this.popularWords.length > 0) {
            return this.popularWords[0].word;
        }

        return "no popular word";
    }

    addNewContent(content) {
        // 先按空格分解成单词
        let wordArr = content.split(" ");
        for (let i = 0; i < wordArr.length; i++) {
            this.addPopularWord(wordArr[i]);
        }
    }

    handleGetPopularWord(conID, data, callback) {
        callback && callback(ErrCode.SUCCESS, this.getMostPopularWord());
    }
}

let cacheMgr = global.cacheMgr || new CacheMgr();
module.exports = cacheMgr;