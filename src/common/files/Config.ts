import {app} from "electron";
import {mkdirsSync} from "fs-extra";
import {existsSync as fileExists, readFileSync, writeFileSync} from "fs";
import {join as joinPath, sep as pathSep} from "path";

export default class Config {

    public static readConfigValue(key: string, noDefault?: boolean) {
        if (fileExists(this.configPath)) {
            const contents: string = readFileSync(this.configPath).toString("utf8");
            const config: object = JSON.parse(contents);
            if (config[key]) {
                return config[key];
            } else if (!noDefault && this.defaultConfig[key]) {
                return this.defaultConfig[key];
            } else {
                return undefined;
            }
        } else {
            if (!noDefault && this.defaultConfig[key]) {
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
        mkdirsSync(this.configPath.split(pathSep).slice(0, -1).join(pathSep));
        writeFileSync(this.configPath, JSON.stringify(config));
    }

    private static defaultConfig = {
        installFolder: joinPath(app.getPath("userData"), "GameData"),
        theme: "light",
    };

    private static configPath = joinPath(app.getPath("userData"), "config.json");
}
