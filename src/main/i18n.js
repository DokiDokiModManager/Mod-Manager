"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const DEFAULT_LOCALE = path_1.join(__dirname, "../../lang/", "en-GB" + ".json");
class I18n {
    constructor(language) {
        this.ignoreFlag = false;
        this.language = language;
        this.langFile = path_1.join(__dirname, "../../../lang/", this.language + ".json");
        this.defaultLanguageData = JSON.parse(fs_1.readFileSync(DEFAULT_LOCALE).toString("utf-8"));
        if (!fs_1.existsSync(this.langFile)) {
            this.languageData = this.defaultLanguageData;
            this.ignoreFlag = true;
        }
        else {
            this.languageData = JSON.parse(fs_1.readFileSync(this.langFile).toString("utf-8"));
        }
    }
    formatString(str, ...args) {
        return str.replace(/{(\d+)}/g, (_, index) => {
            return args[0][index];
        });
    }
    translate(key, ...args) {
        const stringPathSegments = key.split(".");
        let current = this.languageData;
        let currentDefault = this.defaultLanguageData;
        let segment;
        while (stringPathSegments.length > 0) {
            segment = stringPathSegments.shift();
            current = current[segment];
            if (!this.ignoreFlag) {
                currentDefault = currentDefault[segment];
                if (!current) {
                    current = currentDefault;
                }
            }
            else {
                if (!current) {
                    return "[ERROR] No translation found for " + key;
                }
            }
        }
        if (!current) {
            return "[ERROR] No translation found for " + key;
        }
        else {
            return this.formatString(current, args);
        }
    }
    ;
}
exports.default = I18n;
//# sourceMappingURL=i18n.js.map