"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = require("fs");
const path_1 = require("path");
class Config {
    static readConfigValue(key) {
        if (fs_1.existsSync(this.configPath)) {
            const contents = fs_1.readFileSync(this.configPath).toString("utf8");
            const config = JSON.parse(contents);
            if (config[key]) {
                return config[key];
            }
            else if (this.defaultConfig[key]) {
                return this.defaultConfig[key];
            }
            else {
                return undefined;
            }
        }
        else {
            if (this.defaultConfig[key]) {
                return this.defaultConfig[key];
            }
            else {
                return undefined;
            }
        }
    }
    static saveConfigValue(key, value) {
        let config = {};
        if (fs_1.existsSync(this.configPath)) {
            const contents = fs_1.readFileSync(this.configPath).toString("utf8");
            config = JSON.parse(contents);
        }
        config[key] = value;
        fs_1.writeFileSync(this.configPath, JSON.stringify(config));
    }
}
Config.defaultConfig = {
    installFolder: path_1.join(electron_1.app.getPath("documents"), "Doki Doki Mod Manager"),
    theme: "light",
};
Config.configPath = path_1.join(electron_1.app.getPath("userData"), "config.json");
exports.default = Config;
//# sourceMappingURL=Config.js.map