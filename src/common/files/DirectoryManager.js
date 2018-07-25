"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
class DirectoryManager {
    static createDirs(baseFolder) {
        fs_extra_1.mkdirsSync(path_1.join(baseFolder, "mods"));
        fs_extra_1.mkdirsSync(path_1.join(baseFolder, "installs"));
    }
}
exports.default = DirectoryManager;
//# sourceMappingURL=DirectoryManager.js.map