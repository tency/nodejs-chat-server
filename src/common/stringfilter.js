'use strict';

const fs = require("fs");
const path = require("path");

const log = logger.getLogger("string filter");
const kmpMathcher = require("./kmp-matcher");

class StringFilter {
    constructor() {
        this.filterStrings = [];

        // 记录命中次数，遍历的时候按次数从大到小遍历，以提高命中几率
        this.hitCount = [];

        // 重新排序的间隔，避免频繁排序
        this.sortInterval = 2;
        this.testCount = 0;
    }

    // 加载敏感词列表
    loadFilterWords(filename, callback) {
        const fullpath = path.join(process.cwd(), "../src/data", filename);
        fs.readFile(fullpath, "utf-8", (err, data) => {
            if (err) {
                log.error(err);
            } else {
                this.filterStrings = data.split("\r\n");

                // 初始化命中数组
                for (let i = 0; i < this.filterStrings.length; i++) {
                    this.hitCount.push({
                        index: i,
                        count: 0
                    });
                }
                callback && callback();
            }
        });
    }

    // 将目标串中的敏感词替换成***
    replace(str, replaceStr) {
        let result = str;
        for (let i = 0; i < this.filterStrings.length; i++) {
            result = this.replace_str(result, this.filterStrings[i], replaceStr);
        }

        return result;
    }

    // 测试目标字符串是否存在敏感词，存在返回true，不存在返回false
    test(str) {
        this.testCount++;
        if (this.testCount >= this.sortInterval) {
            this.sortHitCount();
            this.testCount = 0;
        }

        for (let i = 0; i < this.hitCount.length; i++) {
            if (this.test_kmp(str, this.filterStrings[this.hitCount[i].index]) > 0) {
                this.hitCount[i].count++;
                return true;
            }
        }

        return false;
    }

    // 返回目标串中所出现的敏感词及次数
    match(str) {
        let retArr = {};
        for (let i = 0; i < this.filterStrings.length; i++) {
            let tmpArr = this.match_kmp(str, this.filterStrings[i]);
            if (tmpArr.length > 0) {
                retArr[this.filterStrings[i]] = tmpArr.length;
            }
        }
        return retArr;
    }

    // 返回模式串在目标串中出现的位置，可能有多个
    match_kmp(str, pattern) {
        return kmpMathcher.kmp(str, pattern);
    }

    // 判断目标串中是否存在模式串,找到一个就返回
    test_kmp(str, pattern) {
        return kmpMathcher.kmp(str, pattern, true);
    }

    replace_str(string, needle, replacement, options = {}) {
        if (typeof string !== 'string') {
            throw new TypeError(`Expected input to be a string, got ${typeof string}`);
        }

        if (!(typeof needle === 'string' && needle.length > 0) ||
            !(typeof replacement === 'string' || typeof replacement === 'function')) {
            return string;
        }

        let result = '';
        let matchCount = 0;
        let prevIndex = options.fromIndex > 0 ? options.fromIndex : 0;

        if (prevIndex > string.length) {
            return string;
        }

        while (true) { // eslint-disable-line no-constant-condition
            const index = string.indexOf(needle, prevIndex);
            if (index === -1) {
                break;
            }

            matchCount++;

            const replaceStr = typeof replacement === 'string' ? replacement : replacement(needle, matchCount, string, index);

            // Get the initial part of the string on the first iteration
            const beginSlice = matchCount === 1 ? 0 : prevIndex;
            result += string.slice(beginSlice, index) + replaceStr;
            prevIndex = index + needle.length;
        }

        if (matchCount === 0) {
            return string;
        }

        return result + string.slice(prevIndex);
    }

    // 对命中次数排序
    sortHitCount() {
        this.hitCount.sort((a, b) => {
            return b.count - a.count;
        });
    }
}

let stringFilter = global.stringFilter || new StringFilter();
module.exports = stringFilter;