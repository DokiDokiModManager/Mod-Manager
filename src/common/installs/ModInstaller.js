"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unzip = require("@zudo/unzipper");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const ModNormaliser_1 = require("../mods/ModNormaliser");
const Logger_1 = require("../utilities/Logger");
class ModInstaller {
    static installMod(modPath, installPath) {
        return new Promise((ff, rj) => {
            ModNormaliser_1.inferMapper(modPath).then((mapper) => {
                for (const file of mapper.getFilesToDelete()) {
                    Logger_1.default.debug("Deleting " + file);
                    fs_1.unlinkSync(path_1.join(installPath, "game", file));
                }
                const zip = unzip(modPath);
                Logger_1.default.info("Installing with mapper: " + mapper.getFriendlyName());
                zip.on("file", (file) => {
                    const newPath = mapper.mapFile(file.path);
                    if (!newPath) {
                        return;
                    }
                    Logger_1.default.debug("Mapping " + file.path + " to " + newPath);
                    const newPathFull = path_1.join(installPath, newPath);
                    const newPathParts = newPathFull.split(path_1.sep);
                    const fileName = newPathParts.pop();
                    fs_extra_1.mkdirsSync(newPathParts.join(path_1.sep));
                    file.openStream((err, stream) => {
                        if (err) {
                            rj(err);
                        }
                        stream.pipe(fs_1.createWriteStream(newPathFull));
                    });
                });
                zip.on("close", () => {
                    ff();
                    Logger_1.default.info("Install completed.");
                });
                zip.on("error", (e) => {
                    Logger_1.default.error("ZIP ERROR: " + e);
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