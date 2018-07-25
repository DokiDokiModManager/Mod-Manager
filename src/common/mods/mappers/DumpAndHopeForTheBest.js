"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
/*
    A last resort attempt to install a mod by dumping everything in the game folder.
    This won't work most of the time, but it's better than giving up.
 */
class DumpAndHopeForTheBest {
    mapFile(path) {
        return path_1.join("game", path);
    }
    getFriendlyName() {
        return "Zipped Game Folder";
    }
}
exports.default = DumpAndHopeForTheBest;
//# sourceMappingURL=DumpAndHopeForTheBest.js.map