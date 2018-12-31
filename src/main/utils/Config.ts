import {app} from "electron";
import {mkdirsSync} from "fs-extra";
import {existsSync as fileExists, readFileSync, writeFileSync} from "fs";
import {join as joinPath, sep as pathSep} from "path";

export default class Config {

    /**
     * Reads a value from the config file
     * @param key The config key
     * @param noDefault If true, return undefined if the key is not found, otherwise return a default value if possible.
     * @returns any The config value
     */
    public static readConfigValue(key: string, noDefault?: boolean): any {
        if (fileExists(this.configPath)) {
            const contents: string = readFileSync(this.configPath).toString("utf8");
            const config: object = JSON.parse(contents);
            if (config.hasOwnProperty(key)) {
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

    /**
     * Save a value to the config file
     * @param key The key
     * @param value The value
     */
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

    /**
     * The default config values
     */
    private static defaultConfig = {
        installFolder: joinPath(app.getPath("userData"), "GameData"),
        background: "default.png",
        discordEnabled: true,
        sdkMode: "always"
    };

    private static configPath = joinPath(app.getPath("userData"), "config.json");
}