import * as unzip from "@zudo/unzipper";
import * as chmodr from "chmodr";
import {createWriteStream, writeFileSync} from "fs";
import {mkdirsSync} from "fs-extra";
import {join as joinPath, sep as pathSep} from "path";
import Config from "../utils/Config";

export default class InstallCreator {

    /**
     * Creates a install of vanilla DDLC
     * @param folderName The folder name to store the install in
     * @param installName The user facing name of the install
     * @param globalSave Whether it should use the global save
     */
    public static createInstall(folderName: string, installName: string, globalSave: boolean): Promise<null> {
        return new Promise((ff, rj) => {
            console.log("Creating clean install in " + folderName);
            const canonicalPath = joinPath(Config.readConfigValue("installFolder"), "installs", folderName);

            try {
                // create the install and appdata directories
                mkdirsSync(joinPath(canonicalPath, "appdata"));
                mkdirsSync(joinPath(canonicalPath, "install"));

                // extract the game from the zip file
                const zip = unzip(joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"));

                zip.on("file", (file) => {
                    console.log("Extracting " + file.path);

                    // get the new path
                    const pathParts = file.path.split("/");

                    console.log(pathParts);

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
                    console.log("Install completed.");

                    // write the install data file
                    writeFileSync(joinPath(canonicalPath, "install.json"), JSON.stringify({
                        globalSave,
                        mod: null,
                        name: installName,
                    }));

                    if (process.platform !== "win32") {
                        // make the directory executable for *nix users
                        chmodr(joinPath(canonicalPath, "install"), 0o774, () => { // it needs to be octal!
                            ff();
                        });
                    } else {
                        ff();
                    }
                });
            } catch (e) {
                rj(e);
            }
        });
    }
}