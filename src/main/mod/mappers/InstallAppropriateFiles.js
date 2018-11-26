"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const ModMapper_1 = require("../ModMapper");
/*
    Take files and put them in their appropriate directories.
    rpy / rpyc / rpa files go in the game folder, whereas chr files go in the characters folder.
    This won't work a lot of the time, but at least it's not "dump and hope for the best".
    Wait, that's a thing too!
 */
class InstallAppropriateFiles extends ModMapper_1.ModMapper {
    mapFile(path) {
        const filename = path.split("/").pop();
        if (filename.match(/\.rp(y|yc|a)$/)) { // it is a ren'py file
            return path_1.join("game", filename);
        }
        else if (filename.match(/\.chr$/)) { // it is a character file
            return path_1.join("characters", filename);
        }
        return null; // ignore it
    }
    getFriendlyName() {
        return "Unsorted Game Files";
    }
}
exports.default = InstallAppropriateFiles;
//# sourceMappingURL=InstallAppropriateFiles.js.map