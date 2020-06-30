import {join as joinPath} from "path";
import {readFileSync, writeFileSync} from "fs";
import {ChildProcess, spawn} from "child_process";
import I18n from "../i18n/i18n";
import Config from "../utils/Config";
import DiscordManager from "../discord/DiscordManager";
import SDKDebugConsole from "../sdk/SDKDebugConsole";
import {LogClass} from "../sdk/LogClass";
import SDKServer from "../sdk/SDKServer";
import Logger from "../utils/Logger";

const lang: I18n = new I18n();

const SDK_HOST: string = "127.0.0.1";
const SDK_PORT: number = 41420;

export default class InstallLauncher {

    private debugConsole: SDKDebugConsole;

    private procHandle: ChildProcess;

    /**
     * Launches an install by the folder name
     * @param folderName The folder of the install to be launched
     * @param richPresence The Discord rich presence instance to be updated
     */
    launchInstall(folderName: string, richPresence?: DiscordManager): Promise<any> {
        return new Promise((ff, rj) => {
            const installFolder: string = joinPath(Config.readConfigValue("installFolder"), "installs", folderName);
            let installData: any;

            if (Config.readConfigValue("sdkDebuggingEnabled")) {
                if (this.debugConsole) {
                    this.debugConsole.shutdown();
                }
                this.debugConsole = new SDKDebugConsole(folderName);
            }

            const logToConsole = (text: string, clazz?: LogClass) => {
                if (this.debugConsole) {
                    this.debugConsole.log(text, clazz);
                }
            }

            logToConsole("Launching install from " + folderName);

            let startSDKServer: boolean = false;

            try {
                installData =
                    JSON.parse(readFileSync(joinPath(installFolder, "install.json")).toString("utf8"));
            } catch (e) {
                logToConsole("Install directory " + installFolder + " does not exist!", LogClass.ERROR);
                rj(lang.translate("main.running_cover.install_corrupt"));
                return;
            }

            if (richPresence) richPresence.setPlayingStatus(installData.name);

            // should we check with the user if the injected script reports no mod installed?
            const checkInstall: boolean = installData.modded && installData.firstRun;
            let checkWithUser: boolean = false;

            if (Config.readConfigValue("sdkMode") !== "never") {
                if (installData.mod && installData.mod.hasOwnProperty("uses_sdk")) {
                    if (installData.mod.uses_sdk) {
                        logToConsole("[SDK] Will launch SDK server (uses_sdk == true)");
                        startSDKServer = true;
                    } else {
                        logToConsole("[SDK] Not launching SDK server (uses_sdk == false)");
                    }
                } else {
                    if (Config.readConfigValue("sdkMode") === "always") {
                        startSDKServer = true;
                        logToConsole("[SDK] The uses_sdk property has not been set in the ddmm-mod.json file. The SDK server will be started due to user preference.", LogClass.WARNING);
                    } else {
                        logToConsole("[SDK] The uses_sdk property has not been set in the ddmm-mod.json file. The SDK server will not be started.", LogClass.WARNING);
                    }
                }
            } else {
                logToConsole("[SDK] The SDK server will not be started due to user preference.", LogClass.WARNING);
            }

            Config.saveConfigValue("lastInstall", {
                "name": installData.name,
                "folder": folderName
            });

            let sdkServer: SDKServer;

            if (startSDKServer) {
                logToConsole("Starting SDK server on " + SDK_PORT);
                sdkServer = new SDKServer(SDK_PORT, SDK_HOST, folderName);

                sdkServer.on("log", (data: { clazz: LogClass, text: string }) => {
                    logToConsole("[SDK] " + data.text, data.clazz);
                });
            }

            // get the path to the game executable, .exe on windows and .sh on Linux
            let gameExecutable: string;

            if (process.platform === "win32") {
                gameExecutable = joinPath(installFolder, "install", "ddlc.exe");
            } else if (process.platform === "linux") {
                gameExecutable = joinPath(installFolder, "install", "DDLC.sh");
            } else if (process.platform === "darwin") {
                gameExecutable = joinPath(installFolder, "install", "MacOS", "DDLC");
            } else {
                throw new Error("I have no idea what kind of computer you're using!");
            }

            // get the path to the save data folder
            const dataFolder = joinPath(installFolder, "appdata");

            // replace the save data environment variable
            const env = installData.globalSave ? process.env : Object.assign(JSON.parse(JSON.stringify(process.env)), {
                APPDATA: dataFolder, // Windows
                HOME: dataFolder, // macOS and Linux
            });

            const renpyConfig = Config.readConfigValue("renpy");

            Object.assign(env, {
                RENPY_SKIP_SPLASHSCREEN: renpyConfig.skipSplash ? "1": undefined,
                RENPY_SKIP_MAIN_MENU: renpyConfig.skipMenu ? "1": undefined,
            });


            logToConsole("Launching game...");

            const startTime: number = Date.now();

            this.procHandle = spawn(gameExecutable, {
                // Overwrite the environment variables to force Ren'Py to save where we want it to.
                // On Windows, the save location is determined by the value of %appdata% but on macOS / Linux
                // it saves based on the home directory location. This can be changed with $HOME but means the save
                // files cannot be directly ported between operating systems.
                cwd: joinPath(installFolder, "install"),
                env,
                detached: true
            });

            this.procHandle.stdout.on("data", data => {
                logToConsole("[STDOUT] " + data.toString());
            });

            this.procHandle.stderr.on("data", data => {
                logToConsole("[STDERR] " + data.toString(), LogClass.ERROR);
                if (checkInstall && data.toString().indexOf("ddmm-modded:no") !== -1) {
                    Logger.warn("Install Launcher", "Mod installation probably failed");
                    checkWithUser = true;
                }
            });

            this.procHandle.on("error", e => {
                if (sdkServer) {
                    sdkServer.shutdown();
                }
                richPresence.setIdleStatus();
                rj(e);
            });

            this.procHandle.on("close", (code: number) => {
                // calculate total play time
                const sessionTime: number = Date.now() - startTime;
                const totalTime: number = installData.playTime ? installData.playTime + sessionTime : sessionTime;

                if (code !== 0) checkWithUser = true;

                if (sdkServer) {
                    sdkServer.shutdown();
                }

                // read again, so sdk data isn't overwritten
                const newInstallData: any = JSON.parse(readFileSync(joinPath(installFolder, "install.json")).toString("utf8"));
                newInstallData.playTime = totalTime;
                newInstallData.firstRun = false;
                newInstallData.installFailed = checkWithUser;

                writeFileSync(joinPath(installFolder, "install.json"), JSON.stringify(newInstallData));

                logToConsole("Game has closed with exit code " + code);
                richPresence.setIdleStatus();
                ff();
            });
        });
    }

    /**
     * Kills the currently running game.
     *
     * This doesn't work on Windows for some reason.
     */
    forceKill() {
        if (this.procHandle) {
            if (this.debugConsole) {
                this.debugConsole.log("User killed the game.", LogClass.ERROR);
            }
            this.procHandle.kill();
        }
    }
}
