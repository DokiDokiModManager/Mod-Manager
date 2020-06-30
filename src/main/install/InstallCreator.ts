import * as chmodr from "chmodr";
import {createWriteStream, writeFileSync} from "fs";
import {mkdirsSync, existsSync} from "fs-extra";
import {join as joinPath, sep as pathSep} from "path";
import Config from "../utils/Config";
import unzip from "../archive/Unzipper";
import InstallManager from "./InstallManager";
import Logger from "../utils/Logger";
import ModManagerHookInjector from "./ModManagerHookInjector";

export default class InstallCreator {

    /**
     * Creates a install of vanilla DDLC
     * @param folderName The folder name to store the install in
     * @param installName The user facing name of the install
     * @param globalSave Whether it should use the global save
     */
    public static createInstall(folderName: string, installName?: string, globalSave?: boolean): Promise<null> {
        return new Promise((ff, rj) => {
            let unarchiving: boolean = false;

            Logger.info("Install Creator", "Creating install folder in " + folderName);
            const canonicalPath = joinPath(Config.readConfigValue("installFolder"), "installs", folderName);

            try {
                // create the install and appdata directories

                if (existsSync(canonicalPath)) {
                    unarchiving = true;
                } else {
                    if (!installName) {
                        rj("No install name provided");
                        return;
                    }

                    mkdirsSync(joinPath(canonicalPath, "appdata"));

                    if (process.platform === "win32") {
                        mkdirsSync(joinPath(canonicalPath, "appdata", "RenPy"));
                    } else if (process.platform === "darwin") {
                        mkdirsSync(joinPath(canonicalPath, "appdata", "Library", "RenPy"));
                    } else {
                        mkdirsSync(joinPath(canonicalPath, "appdata", ".renpy"));
                    }
                }

                mkdirsSync(joinPath(canonicalPath, "install"));

                // extract the game from the zip file
                const zip = unzip(joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"));

                zip.on("file", (file) => {
                    // get the new path
                    const pathParts = file.path.split("/");

                    pathParts.shift(); // remove the base ddlc directory
                    if (pathParts.length == 0) return;

                    if (process.platform === "darwin") {
                        pathParts.shift();
                        if (pathParts.length < 1) return; // remove macOS folders
                    }

                    const fileName = pathParts.pop();
                    mkdirsSync(joinPath(canonicalPath, "install", pathParts.join(pathSep)));

                    // write the file
                    file.openStream((err, stream) => {
                        if (err) {
                            rj(err);
                        }
                        stream.pipe(createWriteStream(joinPath(
                            canonicalPath,
                            "install",
                            pathParts.join(pathSep), fileName)));
                    });
                });

                zip.on("close", () => {
                    ModManagerHookInjector.injectScript(folderName).finally(() => {
                        Logger.info("Install Creator", "Game installation completed");

                        // write the install data file
                        if (unarchiving) {
                            InstallManager.updateInstallDataValue(folderName, "archived", false);
                        } else {
                            writeFileSync(joinPath(canonicalPath, "install.json"), JSON.stringify({
                                globalSave,
                                mod: null,
                                name: installName,
                                playTime: 0,
                                category: "",
                                archived: false,
                                firstRun: true,
                                modded: false
                            }));
                        }

                        if (process.platform !== "win32") {
                            // make the directory executable for *nix users
                            chmodr(joinPath(canonicalPath, "install"), 0o774, () => { // it needs to be octal!
                                ff();
                            });
                        } else {
                            ff();
                        }
                    });
                });
            } catch (e) {
                rj(e);
            }
        });
    }
}
