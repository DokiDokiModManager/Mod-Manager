"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unzip = require("@zudo/unzipper");
const DumpAndHopeForTheBest_1 = require("./mappers/DumpAndHopeForTheBest");
const InstallAppropriateFiles_1 = require("./mappers/InstallAppropriateFiles");
const ModManagerFormat_1 = require("./mappers/ModManagerFormat");
const ModTemplateFormat_1 = require("./mappers/ModTemplateFormat");
const NestedGameFolder_1 = require("./mappers/NestedGameFolder");
const Logger_1 = require("../utilities/Logger");
/*
    This script is intended to take any zip file and try and determine how DDMM should install it, if it is a mod.
    There's so many different ways mods are packaged, so this won't cover every scenario, but DDMM will allow the user
    to install a mod manually if this fails.
 */
/*
    Looks at the file structure of the zip file and attempts to determine what the format of the mod is.
 */
function inferMapper(zipPath) {
    return new Promise((ff, rj) => {
        const zip = unzip(zipPath);
        const structure = [];
        zip.on("file", (file) => {
            structure.push(file.path);
        });
        zip.on("directory", (dir) => {
            structure.push(dir.path);
        });
        zip.on("error", (err) => {
            rj(err);
        });
        zip.on("close", () => {
            if (structure.indexOf("mod.json") !== -1
                || structure.indexOf("game/") !== -1) {
                ff(new ModManagerFormat_1.default());
                return;
            }
            // DDLCtVN special case
            if (structure.find((file) => file.startsWith("DDLCtVN"))) {
                ff(new NestedGameFolder_1.default(["scripts.rpa"]));
                return;
            }
            let isNested = false;
            let isModTemplate = false;
            let onlyRenpy = true;
            for (const path of structure) {
                const pathParts = path.split("/");
                Logger_1.default.debug(path);
                if (pathParts[1] === "game") {
                    isModTemplate = true;
                }
                if (["mod_assets", "python-packages", "saves", "audio.rpa"].indexOf(pathParts[1]) !== -1) {
                    isNested = true;
                }
                if (!path.endsWith("/") &&
                    !path.match(/\.rp(y|yc|a)$/i) &&
                    !path.match(/\.(txt|md|html|pdf|docx)$/i)) {
                    onlyRenpy = false;
                }
            }
            if (isModTemplate) {
                ff(new ModTemplateFormat_1.default());
            }
            else if (isNested) {
                ff(new NestedGameFolder_1.default());
            }
            else if (!onlyRenpy) {
                ff(new DumpAndHopeForTheBest_1.default());
            }
            else {
                ff(new InstallAppropriateFiles_1.default());
            }
        });
    });
}
exports.inferMapper = inferMapper;
//# sourceMappingURL=ModNormaliser.js.map