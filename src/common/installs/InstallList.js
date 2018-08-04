"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const Config_1 = require("../files/Config");
class InstallList {
    static getInstallList() {
        const installs = fs_1.readdirSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs"));
        return installs.map((install) => {
            const path = path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", install);
            let installData;
            try {
                installData = JSON.parse(fs_1.readFileSync(path_1.join(path, "install.json")).toString("utf8"));
            }
            catch (e) {
                installData = {
                    globalSave: false,
                    name: "Unknown Installation",
                };
            }
            return {
                achievements: installData.achievements,
                folderName: install,
                fullFolderName: path,
                globalSave: installData.globalSave,
                installName: installData.name,
            };
        });
    }
}
exports.default = InstallList;
//# sourceMappingURL=InstallList.js.map