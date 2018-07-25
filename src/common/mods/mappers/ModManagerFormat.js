"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    If the mod uses the DDMMv1 mod format, it can be installed 100% of the time without breaking!
    Well, as long as the mod does use the DDMMv1 mod format, and there isn't just a mod.json file sitting
    there for no apparent reason.
 */
class ModManagerFormat {
    mapFile(path) {
        const baseFolder = path.split("/")[0];
        if (baseFolder === "game" || baseFolder === "characters") {
            return path;
        }
        return null; // ignore it
    }
    getFriendlyName() {
        return "Mod (Doki Doki Mod Manager)";
    }
}
exports.default = ModManagerFormat;
//# sourceMappingURL=ModManagerFormat.js.map