import {app} from "electron";
import {existsSync as fileExists, readFileSync, writeFileSync} from "fs";
import {join as joinPath} from "path";

export default class Config {

    public static readConfigValue(key: string) {
        if (fileExists(this.configPath)) {
            const contents: string = readFileSync(this.configPath).toString("utf8");
            const config: object = JSON.parse(contents);
            if (config[key]) {
                return config[key];
            } else if (this.defaultConfig[key]) {
                return this.defaultConfig[key];
            } else {
                return undefined;
            }
        } else {
            if (this.defaultConfig[key]) {
                return this.defaultConfig[key];
            } else {
                return undefined;
            }
        }
    }

    public static saveConfigValue(key: string, value: any) {
        let config: object = {};
        if (fileExists(this.configPath)) {
            const contents: string = readFileSync(this.configPath).toString("utf8");
            config = JSON.parse(contents);
        }
        config[key] = value;
        writeFileSync(this.configPath, JSON.stringify(config));
    }

    private static defaultConfig = {
        installFolder: joinPath(app.getPath("documents"), "Doki Doki Mod Manager"),
        theme: "light",
    };

    private static configPath = joinPath(app.getPath("userData"), "config.json");
}
