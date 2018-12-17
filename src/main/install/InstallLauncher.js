"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const i18n_1 = require("../utils/i18n");
const Config_1 = require("../utils/Config");
const lang = new i18n_1.default(electron_1.app.getLocale());
class InstallLauncher {
    /**
     * Launches an install by the folder name
     * @param folderName The folder of the install to be launched
     * @param richPresence The Discord rich presence instance to be updated
     */
    static launchInstall(folderName, richPresence) {
        return new Promise((ff, rj) => {
            const installFolder = path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", folderName);
            let installData;
            try {
                installData =
                    JSON.parse(fs_1.readFileSync(path_1.join(installFolder, "install.json")).toString("utf8"));
            }
            catch (e) {
                rj(lang.translate("main.running_cover.install_corrupt"));
            }
            if (richPresence)
                richPresence.setPlayingStatus(installData.name);
            Config_1.default.saveConfigValue("lastInstall", {
                "name": installData.name,
                "folder": folderName
            });
            if (fs_1.existsSync(installFolder)) {
                // get the path to the game executable, .exe on windows and .sh on macOS / Linux
                const gameExecutable = path_1.join(installFolder, "install", (process.platform === "win32" ? "ddlc.exe" : "DDLC.sh"));
                // get the path to the save data folder
                const dataFolder = path_1.join(installFolder, "appdata");
                // replace the save data environment variable
                const env = installData.globalSave ? process.env : Object.assign(process.env, {
                    APPDATA: dataFolder,
                    HOME: dataFolder,
                });
                const procHandle = child_process_1.spawn(gameExecutable, [], {
                    // Overwrite the environment variables to force Ren'Py to save where we want it to.
                    // On Windows, the save location is determined by the value of %appdata% but on macOS / Linux
                    // it saves based on the home directory location. This can be changed with $HOME but means the save
                    // files cannot be directly ported between operating systems.
                    cwd: path_1.join(installFolder, "install"),
                    env,
                });
                procHandle.on("error", () => {
                    richPresence.setIdleStatus();
                    rj(lang.translate("main.running_cover.install_crashed"));
                });
                procHandle.on("close", () => {
                    richPresence.setIdleStatus();
                    ff();
                });
            }
            else {
                rj(lang.translate("main.running_cover.install_missing"));
            }
        });
    }
}
exports.default = InstallLauncher;
//# sourceMappingURL=InstallLauncher.js.map