import {app} from "electron";
import {mkdirsSync} from "fs-extra";
import {existsSync as fileExists, readFileSync, writeFileSync} from "fs";
import {join as joinPath, sep as pathSep} from "path";
import Logger from "./Logger";

export default class Config {

    /**
     * Reads a value from the config file
     * @param key The config key
     * @param noDefault If true, return undefined if the key is not found, otherwise return a default value if possible.
     * @returns any The config value
     */
    public static readConfigValue(key: string, noDefault?: boolean): any {
        try {
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
        } catch (e) {
            // issue reading the file?
            writeFileSync(this.configPath, "{}"); // overwrite config file

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
            let contents: string;
            try {
                contents = readFileSync(this.configPath).toString("utf8");
            } catch(e) {
                contents = "{}";
                writeFileSync(this.configPath, "{}"); // overwrite config file
            }
            config = JSON.parse(contents);
        }
        Logger.info("Config", key + " was set to " + JSON.stringify(value));
        config[key] = value;
        mkdirsSync(this.configPath.split(pathSep).slice(0, -1).join(pathSep));
        writeFileSync(this.configPath, JSON.stringify(config));
    }

    /**
     * The default config values
     */
    private static defaultConfig = {
        installFolder: joinPath(app.getPath("userData"), "GameData"),
        background: "default-bg.png",
        discordEnabled: true,
        sdkMode: "always",
        updateChannel: "latest",
        language: global.ddmm_constants.default_language,
        localUI: null,
        modBackgrounds: true,
        renpy: {
            skipSplash: false,
            skipMenu: false,
            screenVariant: null
        }
    };

    private static configPath = joinPath(app.getPath("userData"), "config.json");
}
