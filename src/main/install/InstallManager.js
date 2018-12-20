"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const Config_1 = require("../utils/Config");
const fs_1 = require("fs");
class InstallManager {
    /**
     * Returns whether or not the given install exists (or there is a file/folder with that name)
     * @param folderName The folder/file to check
     */
    static installExists(folderName) {
        return fs_1.existsSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", folderName));
    }
    /**
     * Deletes an install of the game, including save files.
     * @param folderName The folder containing the install
     */
    static deleteInstall(folderName) {
        return new Promise((ff, rj) => {
            const dirPath = path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", folderName);
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
            const dirPath = path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", folderName);
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