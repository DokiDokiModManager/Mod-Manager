"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unzip = require("@zudo/unzipper");
const fs_extra_1 = require("fs-extra");
const fs_extra_2 = require("fs-extra");
const path_1 = require("path");
const ModNormaliser_1 = require("./ModNormaliser");
const ArchiveConverter_1 = require("../archive/ArchiveConverter");
const electron_1 = require("electron");
const crypto_1 = require("crypto");
class ModInstaller {
    static installZip(modPath, installPath) {
        return new Promise((ff, rj) => {
            // determine how we should deal with files
            console.log("Preparing to install mod from " + modPath);
            ModNormaliser_1.inferMapper(modPath).then((mapper) => {
                // delete files that need to be removed (e.g. with DDLCtVN)
                for (const file of mapper.getFilesToDelete()) {
                    console.log("Deleting " + file);
                    fs_extra_1.unlinkSync(path_1.join(installPath, "game", file));
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
                    const newPathFull = path_1.join(installPath, newPath);
                    const newPathParts = newPathFull.split(path_1.sep);
                    newPathParts.pop(); // remove filename from path
                    fs_extra_2.mkdirsSync(newPathParts.join(path_1.sep));
                    // write the file to disk
                    file.openStream((err, stream) => {
                        if (err) {
                            rj(err);
                        }
                        stream.pipe(fs_extra_1.createWriteStream(newPathFull));
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
    static isArchive(filename) {
        return ["zip", "rar", "7z"].filter(ext => filename.endsWith("." + ext)).length > 0;
    }
    /**
     * Installs a mod into a copy of DDLC by guessing which files should go where
     * @param modPath The path to the mod
     * @param installPath The path to the game installation
     */
    static installMod(modPath, installPath) {
        if (modPath.endsWith(".zip")) {
            return ModInstaller.installZip(modPath, installPath);
        }
        else if (ModInstaller.isArchive(modPath)) {
            return new Promise((ff, rj) => {
                const tempZipPath = path_1.join(electron_1.app.getPath("temp"), "ddmm" + crypto_1.randomBytes(8).toString("hex") + ".zip");
                ArchiveConverter_1.default.convertToZip(modPath, tempZipPath).then(() => {
                    ModInstaller.installZip(tempZipPath, installPath).then(() => {
                        fs_extra_1.removeSync(tempZipPath);
                        ff();
                    }).catch(e => {
                        rj(e);
                    });
                }).catch(e => {
                    rj(e);
                });
            });
        }
        else {
            return new Promise((ff, rj) => {
                rj(new Error("File was not an archive."));
            });
        }
    }
}
exports.default = ModInstaller;
//# sourceMappingURL=ModInstaller.js.map