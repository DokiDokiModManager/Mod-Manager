"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_extra_1 = require("fs-extra");
const fs_1 = require("fs");
const path_1 = require("path");
class Config {
    /**
     * Reads a value from the config file
     * @param key The config key
     * @param noDefault If true, return undefined if the key is not found, otherwise return a default value if possible.
     * @returns any The config value
     */
    static readConfigValue(key, noDefault) {
        if (fs_1.existsSync(this.configPath)) {
            const contents = fs_1.readFileSync(this.configPath).toString("utf8");
            const config = JSON.parse(contents);
            if (config.hasOwnProperty(key)) {
                return config[key];
            }
            else if (!noDefault && this.defaultConfig[key]) {
                return this.defaultConfig[key];
            }
            else {
                return undefined;
            }
        }
        else {
            if (!noDefault && this.defaultConfig[key]) {
                return this.defaultConfig[key];
            }
            else {
                return undefined;
            }
        }
    }
    /**
     * Save a value to the config file
     * @param key The key
     * @param value The value
     */
    static saveConfigValue(key, value) {
        let config = {};
        if (fs_1.existsSync(this.configPath)) {
            const contents = fs_1.readFileSync(this.configPath).toString("utf8");
            config = JSON.parse(contents);
        }
        config[key] = value;
        fs_extra_1.mkdirsSync(this.configPath.split(path_1.sep).slice(0, -1).join(path_1.sep));
        fs_1.writeFileSync(this.configPath, JSON.stringify(config));
    }
}
/**
 * The default config values
 */
Config.defaultConfig = {
    installFolder: path_1.join(electron_1.app.getPath("userData"), "GameData"),
    background: "default.png",
    discordEnabled: true,
    sdkMode: "always",
    updateChannel: "latest"
};
Config.configPath = path_1.join(electron_1.app.getPath("userData"), "config.json");
exports.default = Config;
//# sourceMappingURL=Config.js.map