const fs = require("fs");
const path = require("path");

const DEFAULT_LOCALE = path.join(__dirname, "../../../lang/", "en-GB" + ".json");

function formatString(str, ...args) {
    return str.replace(/{(\d+)}/g, (_, index) => {
        return args[0][index];
    });
}

module.exports = function (language) {
    const langFile = path.join(__dirname, "../../../lang/", language + ".json");

    let languageData;
    let defaultLanguageData = JSON.parse(fs.readFileSync(DEFAULT_LOCALE).toString("utf-8"));
    let ignoreFlag = false;

    if (!fs.existsSync(langFile)) {
        languageData = defaultLanguageData;
        ignoreFlag = true;
    } else {
        languageData = JSON.parse(fs.readFileSync(langFile).toString("utf-8"));
    }

    return function (stringPath, ...args) {
        const stringPathSegments = stringPath.split(".");
        let current = languageData;
        let currentDefault = defaultLanguageData;
        let segment;
        while (stringPathSegments.length > 0) {
            segment = stringPathSegments.shift();

            current = current[segment];

            if (!ignoreFlag) {
                currentDefault = currentDefault[segment];

                if (!current) {
                    current = currentDefault;
                }
            } else {
                if (!current) {
                    return "[ERROR] No translation found for " + stringPath;
                }
            }
        }
        if (!current) {
            return "[ERROR] No translation found for " + stringPath;
        } else {
            return formatString(current, args);
        }
    };
};