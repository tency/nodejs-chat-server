'use strict';

global.logger = require("../src/common/logger");
logger.setupLog("string filter");

const stringfilter = require("../src/common/stringfilter");
stringfilter.loadFilterWords("filter.txt", () => {

    // test
    for (let i = 0; i < 10; i++) {
        const str = "goodbitch fck like func fuc";
        let ret = stringfilter.test(str);
    }

    // replace test
    let targetString = "fuck the world, this  is bitch thing! F_U_C_Kfuck";
    let replaceStr = "***";
    let afterStr = stringfilter.replace(targetString, replaceStr);
    console.log(afterStr)

    // match test
    let hitWords = stringfilter.match(targetString);
    console.log(hitWords);
});