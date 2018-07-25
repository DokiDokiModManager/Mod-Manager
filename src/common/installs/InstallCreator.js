"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unzip = require("@zudo/unzipper");
const chmodr = require("chmodr");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const Config_1 = require("../files/Config");
const Logger_1 = require("../utilities/Logger");
class InstallCreator {
    static createInstall(folderName, installName, globalSave) {
        return new Promise((ff, rj) => {
            Logger_1.default.info("Creating clean install in " + folderName);
            const canonicalPath = path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", folderName);
            fs_extra_1.mkdirsSync(path_1.join(canonicalPath, "appdata"));
            fs_extra_1.mkdirsSync(path_1.join(canonicalPath, "install"));
            const zip = unzip(path_1.join(Config_1.default.readConfigValue("installFolder"), "ddlc.zip"));
            zip.on("file", (file) => {
                Logger_1.default.debug("Extracting " + file.path);
                const pathParts = file.path.split("/");
                pathParts.shift(); // remove the base ddlc directory
                const fileName = pathParts.pop();
                fs_extra_1.mkdirsSync(path_1.join(canonicalPath, "install", pathParts.join(path_1.sep)));
                file.openStream((err, stream) => {
                    if (err) {
                        rj(err);
                    }
                    stream.pipe(fs_1.createWriteStream(path_1.join(canonicalPath, "install", pathParts.join(path_1.sep), fileName)));
                });
            });
            zip.on("close", () => {
                Logger_1.default.info("Install completed.");
                fs_1.writeFileSync(path_1.join(canonicalPath, "install.json"), JSON.stringify({
                    globalSave,
                    mod: null,
                    name: installName,
                }));
                if (process.platform !== "win32") {
                    chmodr(path_1.join(canonicalPath, "install"), 0o774, () => {
                        ff();
                    });
                }
                else {
                    ff();
                }
            });
        });
    }
}
exports.default = InstallCreator;
//# sourceMappingURL=InstallCreator.js.map