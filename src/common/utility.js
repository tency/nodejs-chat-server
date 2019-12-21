'use strict';

module.exports = class Utility {
    static removeFromArray(array, elem) {
        const index = array.indexOf(elem);
        if (index < 0) {
            return false;
        }
        array.splice(index, 1);
        return true;
    }

    static randomString(len, charSet) {
        charSet = charSet || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let randomString = "";
        for (let i = 0; i < len; i++) {
            const randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }
        return randomString;
    }

    // range: [min, max)
    static randomNumber(min, max) {
        let delta = max - min;
        return min + Math.floor(Math.random() * delta);
    }

    static getTime(day) {
        if (day) {
            var year = Math.floor(day / 10000);
            var month = Math.floor((day % 10000) / 100);
            var dy = Math.floor(day % 100);

            return Math.floor((Date.parse('' + year + '/' + month + '/' + dy)) / 1000);
        }

        return Math.round(+(new Date()) / 1000);
    }

    // 根据uid返回db服务器id
    static getDbIdByUid(uid) {
        return Math.floor(uid / 1000000 / Config.serverId);
    }
}