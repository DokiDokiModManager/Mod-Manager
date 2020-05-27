import {app} from "electron";
import {join as joinPath} from "path";
import {readFileSync, existsSync} from "fs";
import Config from "../utils/Config";
import Logger from "../utils/Logger";

const DEFAULT_LOCALE: string = joinPath(__dirname, "../../../lang/", "en-GB" + ".json");

export default class I18n {
    private readonly language: string;
    private readonly langFile: string;
    private readonly languageData: object;
    private readonly defaultLanguageData: object;

    constructor() {
        this.language = process.env.DDMM_LANG || Config.readConfigValue("language") || "en-GB";
        this.langFile = joinPath(app.getPath("userData"), "language", this.language + ".json");

        this.defaultLanguageData = JSON.parse(readFileSync(DEFAULT_LOCALE).toString("utf-8"));

        if (!existsSync(this.langFile)) {
            this.langFile = joinPath(__dirname, "../../../lang/", this.language + ".json");
            Logger.info("i18n", "Using preloaded language data from " + this.langFile)
        } else {
            Logger.info("i18n", "Using cached language data from " + this.langFile)
        }

        try {
            this.languageData = JSON.parse(readFileSync(this.langFile).toString("utf-8"));
        } catch (e) {
            Logger.warn("i18n", "No language data found for " + this.language);
            this.languageData = this.defaultLanguageData;
        }
    }

    private formatString(str: any, ...args: string[][]) {
        return str.replace(/{(\d+)}/g, (_, index) => {
            return args[0][index];
        });
    }

    private static getValue(obj: any, key: string) {
        try {
            return key.split(".").reduce((o, i) => o[i], obj);
        } catch {
            return undefined;
        }
    }

    translate(key: string, ...args: string[]): string {
        return this.formatString(
            I18n.getValue(this.languageData, key) || I18n.getValue(this.defaultLanguageData, key) || key,
            args
        );
    };
}
