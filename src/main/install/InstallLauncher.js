"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const i18n_1 = require("../utils/i18n");
const Config_1 = require("../utils/Config");
const SDKDebugConsole_1 = require("../sdk/SDKDebugConsole");
const LogClass_1 = require("../sdk/LogClass");
const SDKServer_1 = require("../sdk/SDKServer");
const lang = new i18n_1.default(electron_1.app.getLocale());
const SDK_HOST = "127.0.0.1";
const SDK_PORT = 41420;
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
            if (Config_1.default.readConfigValue("sdkDebuggingEnabled")) {
                if (this.debugConsole) {
                    this.debugConsole.shutdown();
                }
                this.debugConsole = new SDKDebugConsole_1.default(folderName);
            }
            function logToConsole(text, clazz) {
                if (InstallLauncher.debugConsole) {
                    InstallLauncher.debugConsole.log(text, clazz);
                }
            }
            logToConsole("Launching install from " + folderName);
            let startSDKServer = false;
            try {
                installData =
                    JSON.parse(fs_1.readFileSync(path_1.join(installFolder, "install.json")).toString("utf8"));
            }
            catch (e) {
                logToConsole("Install directory " + installFolder + " does not exist!", LogClass_1.LogClass.ERROR);
                rj(lang.translate("main.running_cover.install_corrupt"));
                return;
            }
            if (richPresence)
                richPresence.setPlayingStatus(installData.name);
            if (Config_1.default.readConfigValue("sdkMode") !== "never") {
                if (installData.mod && installData.mod.hasOwnProperty("uses_sdk")) {
                    if (installData.mod.uses_sdk) {
                        logToConsole("[SDK] Will launch SDK server (uses_sdk == true)");
                        startSDKServer = true;
                    }
                    else {
                        logToConsole("[SDK] Not launching SDK server (uses_sdk == false)");
                    }
                }
                else {
                    if (Config_1.default.readConfigValue("sdkMode") === "always") {
                        startSDKServer = true;
                        logToConsole("[SDK] The uses_sdk property has not been set in the ddmm-mod.json file. The SDK server will be started due to user preference.", LogClass_1.LogClass.WARNING);
                    }
                    else {
                        logToConsole("[SDK] The uses_sdk property has not been set in the ddmm-mod.json file. The SDK server will not be started.", LogClass_1.LogClass.WARNING);
                    }
                }
            }
            else {
                logToConsole("[SDK] The SDK server will not be started due to user preference.", LogClass_1.LogClass.WARNING);
            }
            Config_1.default.saveConfigValue("lastInstall", {
                "name": installData.name,
                "folder": folderName
            });
            let sdkServer;
            if (startSDKServer) {
                logToConsole("Starting SDK server on " + SDK_PORT);
                sdkServer = new SDKServer_1.default(SDK_PORT, SDK_HOST, folderName);
                sdkServer.on("log", (data) => {
                    logToConsole("[SDK] " + data.text, data.clazz);
                });
            }
            // get the path to the game executable, .exe on windows and .sh on macOS / Linux
            const gameExecutable = path_1.join(installFolder, "install", (process.platform === "win32" ? "ddlc.exe" : "DDLC.sh"));
            // get the path to the save data folder
            const dataFolder = path_1.join(installFolder, "appdata");
            // replace the save data environment variable
            const env = installData.globalSave ? process.env : Object.assign(JSON.parse(JSON.stringify(process.env)), {
                APPDATA: dataFolder,
                HOME: dataFolder,
            });
            logToConsole("Launching game...");
            const procHandle = child_process_1.spawn(gameExecutable, [], {
                // Overwrite the environment variables to force Ren'Py to save where we want it to.
                // On Windows, the save location is determined by the value of %appdata% but on macOS / Linux
                // it saves based on the home directory location. This can be changed with $HOME but means the save
                // files cannot be directly ported between operating systems.
                cwd: path_1.join(installFolder, "install"),
                env,
            });
            procHandle.stdout.on("data", data => {
                logToConsole("[STDOUT] " + data.toString());
            });
            procHandle.stderr.on("data", data => {
                logToConsole("[STDERR] " + data.toString(), LogClass_1.LogClass.ERROR);
            });
            procHandle.on("error", () => {
                sdkServer.shutdown();
                richPresence.setIdleStatus();
                rj(lang.translate("main.running_cover.install_crashed"));
            });
            procHandle.on("close", () => {
                sdkServer.shutdown();
                logToConsole("Game has closed.");
                richPresence.setIdleStatus();
                ff();
            });
        });
    }
}
exports.default = InstallLauncher;
//# sourceMappingURL=InstallLauncher.js.map