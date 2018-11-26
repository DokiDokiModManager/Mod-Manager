import * as unzip from "@zudo/unzipper";
import {createWriteStream, unlinkSync} from "fs";
import {mkdirsSync} from "fs-extra";
import {join as joinPath, sep as pathSep} from "path";
import {inferMapper} from "./ModNormaliser";

export default class ModInstaller {

    /**
     * Installs a mod into a copy of DDLC by guessing which files should go where
     * @param modPath The path to the mod
     * @param installPath The path to the game installation
     */
    public static installMod(modPath: string, installPath: string) {
        return new Promise((ff, rj) => {
            // determine how we should deal with files
            inferMapper(modPath).then((mapper) => {
                // delete files that need to be removed (e.g. with DDLCtVN)
                for (const file of mapper.getFilesToDelete()) {
                    console.log("Deleting " + file);
                    unlinkSync(joinPath(installPath, "game", file));
                }

                // extract the mod
                const zip = unzip(modPath);

                console.log("Installing with mapper: " + mapper.getFriendlyName());

                zip.on("file", (file) => {
                    // get the new relative path
                    const newPath = mapper.mapFile(file.path);
                    if (!newPath) {
                        return;
                    }
                    console.log("Mapping " + file.path + " to " + newPath);
                    // convert the relative path to an absolute path
                    const newPathFull = joinPath(installPath, newPath);
                    const newPathParts = newPathFull.split(pathSep);
                    const fileName = newPathParts.pop(); // this may be used in the future :/
                    mkdirsSync(newPathParts.join(pathSep));
                    // write the file to disk
                    file.openStream((err, stream) => {
                        if (err) {
                            rj(err);
                        }
                        stream.pipe(createWriteStream(newPathFull));
                    });
                });

                zip.on("close", () => {
                    ff();
                    console.log("Install completed.");
                });

                zip.on("error", (e) => {
                    console.log("ZIP ERROR: " + e);
                    rj(e);
                });
            }).catch((err) => {
                rj(err);
            });
        });
    }
}