'use strict';
global.logger = require("../src/common/logger");
logger.setupLog("test");
const log = logger.getLogger("stringfiltertest");
const stringfilter = require("../src/common/stringfilter");
const path = require("path");

test("string filter test", () => {
    const fullpath = path.join(process.cwd(), "./src/data/list.txt");
    stringfilter.loadFilterWords(fullpath, () => {

        // test
        const str = "goodbitch fck like func fuck";
        expect(stringfilter.test(str)).toBe(true);

        // replace test
        let targetString = "fuck the world, this  is bitch thing! F_U_C_Kfuck";
        let replaceStr = "***";
        let afterStr = stringfilter.replace(targetString, replaceStr);

        // match test
        let matchWords = stringfilter.match(targetString);
        expect(matchWords["fuck"]).toBeGreaterThan(0);
    });
});