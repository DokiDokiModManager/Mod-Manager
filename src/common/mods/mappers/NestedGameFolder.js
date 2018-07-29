"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    A dodgy format where the game folder is not in the root of the zip.
    Used by DDLCtVN
 */
const path_1 = require("path");
const ModMapper_1 = require("../ModMapper");
class NestedGameFolder extends ModMapper_1.ModMapper {
    mapFile(path) {
        const pathParts = path.split("/");
        pathParts[0] = "game";
        return pathParts.join(path_1.sep); // ignore it
    }
    getFriendlyName() {
        return "Nested Game Folder";
    }
}
exports.default = NestedGameFolder;
//# sourceMappingURL=NestedGameFolder.js.map