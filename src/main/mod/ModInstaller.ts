import * as unzip from "@zudo/unzipper";
import {createWriteStream, unlinkSync, removeSync} from "fs-extra";
import {mkdirsSync} from "fs-extra";
import {join as joinPath, sep as pathSep} from "path";
import {inferMapper} from "./ModNormaliser";
import ArchiveConverter from "../archive/ArchiveConverter";
import {app} from "electron";
import {randomBytes} from "crypto";

export default class ModInstaller {

    private static installZip(modPath: string, installPath: string): Promise<null> {
        return new Promise((ff, rj) => {
            // determine how we should deal with files
            console.log("Preparing to install mod from " + modPath);
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
                    newPathParts.pop(); // remove filename from path
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
                console.log(err);
                rj(err);
            });
        });
    }

    private static isArchive(filename: string): boolean {
        return ["zip", "rar", "7z"].filter(ext => filename.endsWith("." + ext)).length > 0;
    }

    /**
     * Installs a mod into a copy of DDLC by guessing which files should go where
     * @param modPath The path to the mod
     * @param installPath The path to the game installation
     */
    public static installMod(modPath: string, installPath: string): Promise<null> {
        if (modPath.endsWith(".zip")) {
            return ModInstaller.installZip(modPath, installPath);
        } else if (ModInstaller.isArchive(modPath)) {
            return new Promise((ff, rj) => {
                const tempZipPath: string = joinPath(app.getPath("temp"), "ddmm" + randomBytes(8).toString("hex") + ".zip");
                ArchiveConverter.convertToZip(modPath, tempZipPath).then(() => {
                    ModInstaller.installZip(tempZipPath, installPath).then(() => {
                        removeSync(tempZipPath);
                        ff();
                    }).catch(e => {
                        rj(e);
                    });
                }).catch(e => {
                    rj(e);
                });
            });
        } else {
            return new Promise((ff, rj) => {
                rj(new Error("File was not an archive."));
            })
        }
    }
}