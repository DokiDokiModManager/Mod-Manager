import * as unzip from "@zudo/unzipper";
import * as chmodr from "chmodr";
import {createWriteStream, writeFileSync} from "fs";
import {mkdirsSync} from "fs-extra";
import {join as joinPath, sep as pathSep} from "path";
import Config from "../files/Config";
import Logger from "../utilities/Logger";

export default class InstallCreator {

    public static createInstall(folderName: string, installName: string, globalSave: boolean) {
        return new Promise((ff, rj) => {
            Logger.info("Creating clean install in " + folderName);
            const canonicalPath = joinPath(Config.readConfigValue("installFolder"), "installs", folderName);

            mkdirsSync(joinPath(canonicalPath, "appdata"));
            mkdirsSync(joinPath(canonicalPath, "install"));

            const zip = unzip(joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"));

            zip.on("file", (file) => {
                Logger.debug("Extracting " + file.path);
                const pathParts = file.path.split("/");
                pathParts.shift(); // remove the base ddlc directory
                const fileName = pathParts.pop();
                mkdirsSync(joinPath(canonicalPath, "install", pathParts.join(pathSep)));
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
                Logger.info("Install completed.");

                writeFileSync(joinPath(canonicalPath, "install.json"), JSON.stringify({
                    globalSave,
                    mod: null,
                    name: installName,
                }));

                if (process.platform !== "win32") {
                    chmodr(joinPath(canonicalPath, "install"), 0o774, () => { // it needs to be octal!
                        ff();
                    });
                } else {
                    ff();
                }
            });
        });
    }
}
