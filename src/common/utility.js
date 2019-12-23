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

    // timeInitial是一个长度为4的字符串数组，表示日、时、分、秒，如[d, h, m, s]
    static formatTimeWithInitial(seconds, timeInitial) {
        let postfix = timeInitial || ['Day', 'Hour', 'Min', 'Sec'];

        if (seconds <= 0) {
            return '00' + postfix[3];
        }
        let days = Math.floor(seconds / 86400);
        seconds = seconds % 86400;
        let hours = Math.floor(seconds / 3600);
        seconds = seconds % 3600;
        let mins = Math.floor(seconds / 60);
        let secs = seconds % 60;

        let leftTimeArray = [days, hours, mins, secs];

        while (leftTimeArray != null && leftTimeArray.length > 0 &&
            (leftTimeArray[0] == null || leftTimeArray[0] == 0)
        ) {
            postfix.shift();
            leftTimeArray.shift();
        }

        let leftTimes = leftTimeArray.map(function (time, index) {
            if (time < 0) {
                return '';
            }
            return (time < 10 ? '0' + time : time) + postfix[index];
        });

        return leftTimes.join(' ');
    };

    // 如果时间小于一天会显示为00:00:00的样子，如果大于1天会显示为1Day1Hour
    static formatTimeAsRemainTime(seconds) {
        const days = Math.floor(seconds / 86400);
        if (days > 0) {
            seconds = seconds % 86400;
            let hours = Math.floor(seconds / 3600);
            return days + 'Day ' + hours + 'Hour';
        } else
            return this.formatTimeWithColon(seconds, 2);
    }

    // 将时间转换为00:00或00:00:00的字符串
    static formatTimeWithColon(seconds, colonNum) {
        let days = Math.floor(seconds / 86400);
        seconds = seconds % 86400;
        let hours = Math.floor(seconds / 3600);
        seconds = seconds % 3600;
        let mins = Math.floor(seconds / 60);
        let secs = seconds % 60;
        if (colonNum === 1) {
            return `${days * 1440 + hours * 60 + mins}:${secs}`;
        }
        if (colonNum === 2) {
            return `${days * 24 + hours}:${mins}:${secs}`;
        }
    }
}