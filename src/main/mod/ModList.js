"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const Config_1 = require("../utils/Config");
class ModList {
    /**
     * Reads the mod directory and returns the contents (filtered to only include .zip files)
     * @returns string[] A list of mod filenames
     */
    static getModList() {
        const modFolder = path_1.join(Config_1.default.readConfigValue("installFolder"), "mods");
        return fs_1.readdirSync(modFolder).filter(fn => {
            return ["zip", "rar", "7z", "gz"].filter(ext => fn.endsWith("." + ext)).length > 0;
        });
    }
}
exports.default = ModList;
//# sourceMappingURL=ModList.js.map