"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
/*
    This name isn't quite accurate. It actually works with any mod that has one folder in the root of the zip file,
    then the game, characters etc in that folder. As therationalpi's mod template exports to this format, it seems like
    a good name.
 */
class ModTemplateFormat {
    mapFile(path) {
        const pathParts = path.split("/");
        const baseFolder = pathParts.shift();
        if (pathParts[0] === "game" || pathParts[0] === "characters") {
            return pathParts.join(path_1.sep);
        }
        return null; // ignore it
    }
    getFriendlyName() {
        return "Mod (DDLC Mod Template)";
    }
}
exports.default = ModTemplateFormat;
//# sourceMappingURL=ModTemplateFormat.js.map