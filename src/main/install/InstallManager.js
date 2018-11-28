"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const config_1 = require("../config");
const fs_1 = require("fs");
class InstallManager {
    /**
     * Deletes an install of the game, including save files.
     * @param folderName The folder containing the install
     */
    static deleteInstall(folderName) {
        return new Promise((ff, rj) => {
            const dirPath = path_1.join(config_1.default.readConfigValue("installFolder"), "installs", folderName);
            if (fs_1.existsSync(dirPath)) {
                fs_extra_1.remove(dirPath).then(ff).catch(rj);
            }
            else {
                rj(new Error("Install does not exist."));
            }
        });
    }
    /**
     * Deletes the save file of an install.
     * @param folderName The folder containing the install
     */
    static deleteSaveData(folderName) {
        return new Promise((ff, rj) => {
            const dirPath = path_1.join(config_1.default.readConfigValue("installFolder"), "installs", folderName);
            if (fs_1.existsSync(dirPath)) {
                fs_extra_1.emptyDir(path_1.join(dirPath, "appdata")).then(ff).catch(rj);
            }
            else {
                rj(new Error("Install does not exist."));
            }
        });
    }
}
exports.default = InstallManager;
//# sourceMappingURL=InstallManager.js.map