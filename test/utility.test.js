const Utility = require("../src/common/utility");

let randomString = Utility.randomString(16);
console.log(randomString);

for (let i = 0; i < 10; i++) {
    let randomNumber = Utility.randomNumber(0, 10000);
    console.log(randomNumber);
}

console.log(Utility.getTime());