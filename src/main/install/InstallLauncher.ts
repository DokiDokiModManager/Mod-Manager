import {join as joinPath} from "path";
import {existsSync, readFileSync} from "fs";
import {app} from "electron";
import {spawn} from "child_process";
import I18n from "../utils/i18n";
import Config from "../utils/Config";
import DiscordManager from "../discord/DiscordManager";

const lang: I18n = new I18n(app.getLocale());

export default class InstallLauncher {

    /**
     * Launches an install by the folder name
     * @param folderName The folder of the install to be launched
     * @param richPresence The Discord rich presence instance to be updated
     */
    static launchInstall(folderName: string, richPresence?: DiscordManager): Promise<any> {
        return new Promise((ff, rj) => {
            const installFolder: string = joinPath(Config.readConfigValue("installFolder"), "installs", folderName);
            let installData: any;

            try {
                installData =
                    JSON.parse(readFileSync(joinPath(installFolder, "install.json")).toString("utf8"));
            } catch (e) {
                rj(lang.translate("main.running_cover.install_corrupt"));
            }

            if (richPresence) richPresence.setPlayingStatus(installData.name);

            Config.saveConfigValue("lastInstall", {
                "name": installData.name,
                "folder": folderName
            });

            if (existsSync(installFolder)) {
                // get the path to the game executable, .exe on windows and .sh on macOS / Linux
                const gameExecutable: string = joinPath(installFolder, "install", (process.platform === "win32" ? "ddlc.exe" : "DDLC.sh"));

                // get the path to the save data folder
                const dataFolder = joinPath(installFolder, "appdata");

                // replace the save data environment variable
                const env = installData.globalSave ? process.env : Object.assign(process.env, {
                    APPDATA: dataFolder, // Windows
                    HOME: dataFolder, // macOS and Linux
                });

                const procHandle = spawn(gameExecutable, [], {
                    // Overwrite the environment variables to force Ren'Py to save where we want it to.
                    // On Windows, the save location is determined by the value of %appdata% but on macOS / Linux
                    // it saves based on the home directory location. This can be changed with $HOME but means the save
                    // files cannot be directly ported between operating systems.
                    cwd: joinPath(installFolder, "install"),
                    env,
                });

                procHandle.on("error", () => {
                    richPresence.setIdleStatus();
                    rj(lang.translate("main.running_cover.install_crashed"))
                });

                procHandle.on("close", () => {
                    richPresence.setIdleStatus();
                    ff();
                });

            } else {
                rj(lang.translate("main.running_cover.install_missing"));
            }
        });
    }
}