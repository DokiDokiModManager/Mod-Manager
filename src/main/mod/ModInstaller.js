"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unzip = require("@zudo/unzipper");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const ModNormaliser_1 = require("./ModNormaliser");
class ModInstaller {
    /**
     * Installs a mod into a copy of DDLC by guessing which files should go where
     * @param modPath The path to the mod
     * @param installPath The path to the game installation
     */
    static installMod(modPath, installPath) {
        return new Promise((ff, rj) => {
            // determine how we should deal with files
            ModNormaliser_1.inferMapper(modPath).then((mapper) => {
                // delete files that need to be removed (e.g. with DDLCtVN)
                for (const file of mapper.getFilesToDelete()) {
                    console.log("Deleting " + file);
                    fs_1.unlinkSync(path_1.join(installPath, "game", file));
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
                    const fileName = newPathParts.pop(); // this may be used in the future :/
                    fs_extra_1.mkdirsSync(newPathParts.join(path_1.sep));
                    // write the file to disk
                    file.openStream((err, stream) => {
                        if (err) {
                            rj(err);
                        }
                        stream.pipe(fs_1.createWriteStream(newPathFull));
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
exports.default = ModInstaller;
//# sourceMappingURL=ModInstaller.js.map