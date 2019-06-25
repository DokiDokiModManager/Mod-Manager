import {join as joinPath} from "path";
import {readFileSync, existsSync} from "fs";
import Config from "./Config";

const DEFAULT_LOCALE = joinPath(__dirname, "../../../lang/", "en-GB" + ".json");

export default class I18n {
    private readonly language: string;
    private readonly langFile: string;
    private readonly languageData: object;
    private readonly defaultLanguageData: object;
    private readonly ignoreFlag: boolean = false;

    constructor() {
        this.language = process.env.DDMM_LANG || Config.readConfigValue("language") || "en-GB";
        this.langFile = joinPath(__dirname, "../../../lang/", this.language + ".json");

        this.defaultLanguageData = JSON.parse(readFileSync(DEFAULT_LOCALE).toString("utf-8"));

        if (!existsSync(this.langFile)) {
            this.languageData = this.defaultLanguageData;
            this.ignoreFlag = true;
        } else {
            this.languageData = JSON.parse(readFileSync(this.langFile).toString("utf-8"));
        }
    }

    private formatString(str: any, ...args: string[][]) {
        return str.replace(/{(\d+)}/g, (_, index) => {
            return args[0][index];
        });
    }

    translate(key: string, ...args: string[]) {
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
            } else {
                if (!current) {
                    return "[ERROR] No translation found for " + key;
                }
            }
        }
        if (!current) {
            return "[ERROR] No translation found for " + key;
        } else {
            return (process.env.DDMM_LANG_PROOF ? "[translated] " : "") + this.formatString(current, args);
        }
    };
}