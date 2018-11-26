"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unzip = require("@zudo/unzipper");
const chmodr = require("chmodr");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const config_1 = require("./config");
class InstallCreator {
    /**
     * Creates a install of vanilla DDLC
     * @param folderName The folder name to store the install in
     * @param installName The user facing name of the install
     * @param globalSave Whether it should use the global save
     */
    static createInstall(folderName, installName, globalSave) {
        return new Promise((ff, rj) => {
            console.log("Creating clean install in " + folderName);
            const canonicalPath = path_1.join(config_1.default.readConfigValue("installFolder"), "installs", folderName);
            try {
                // create the install and appdata directories
                fs_extra_1.mkdirsSync(path_1.join(canonicalPath, "appdata"));
                fs_extra_1.mkdirsSync(path_1.join(canonicalPath, "install"));
                // extract the game from the zip file
                const zip = unzip(path_1.join(config_1.default.readConfigValue("installFolder"), "ddlc.zip"));
                zip.on("file", (file) => {
                    console.log("Extracting " + file.path);
                    // get the new path
                    const pathParts = file.path.split("/");
                    pathParts.shift(); // remove the base ddlc directory
                    const fileName = pathParts.pop();
                    fs_extra_1.mkdirsSync(path_1.join(canonicalPath, "install", pathParts.join(path_1.sep)));
                    // write the file
                    file.openStream((err, stream) => {
                        if (err) {
                            rj(err);
                        }
                        stream.pipe(fs_1.createWriteStream(path_1.join(canonicalPath, "install", pathParts.join(path_1.sep), fileName)));
                    });
                });
                zip.on("close", () => {
                    console.log("Install completed.");
                    // write the install data file
                    fs_1.writeFileSync(path_1.join(canonicalPath, "install.json"), JSON.stringify({
                        globalSave,
                        mod: null,
                        name: installName,
                    }));
                    if (process.platform !== "win32") {
                        // make the directory executable for *nix users
                        chmodr(path_1.join(canonicalPath, "install"), 0o774, () => {
                            ff();
                        });
                    }
                    else {
                        ff();
                    }
                });
            }
            catch (e) {
                rj(e);
            }
        });
    }
}
exports.default = InstallCreator;
//# sourceMappingURL=install_creator.js.map