'use strict';
const fs = require("fs");
const path = require("path");
const process = require("process");

module.exports = class SchemaMgr {
    constructor() {
        this.schemaDictionary = {};
    }

    loadAllSchema(schemaPath) {
        try {
            const fullPath = path.join(process.cwd(), schemaPath);
            let fileNames = fs.readdirSync(fullPath);
            fileNames = fileNames.filter(value => {
                return path.extname(value).toLowerCase() == ".js";
            });

            if (fileNames.length == 0) {
                return false;
            }

            fileNames.forEach((fileName) => {
                const schemaModule = require(path.join(fullPath, fileName));
                this.schemaDictionary[path.basename(fileName, ".js")] = schemaModule;
            });
            return true;
        } catch {
            return false;
        }
    }

    getSchema(name) {
        return this.schemaDictionary[name];
    }
}