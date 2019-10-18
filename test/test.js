const fs = require("fs");
const assert = require("assert");

describe('i18n functions', function () {
    it('should parse each file without errors', function () {
        fs.readdirSync("lang").forEach(fn => {
            if (fn.endsWith(".json")) {
                const fileContents = fs.readFileSync("lang/" + fn, "utf8");
                JSON.parse(fileContents);
            }
        });
    });
});
