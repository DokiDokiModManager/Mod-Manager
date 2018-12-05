"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const child_process_1 = require("child_process");
const path_1 = require("path");
const electron_1 = require("electron");
class ArchiveConverter {
    static convertToZip(pathToArchive, output) {
        return new Promise((ff, rj) => {
            if (process.platform !== "win32") {
                rj(new Error("Archive convertion is only supported on Windows."));
            }
            const tempDir = fs_extra_1.mkdtempSync(path_1.join(electron_1.app.getPath("temp"), "ddmm-archive"));
            console.log("Converting " + tempDir);
            // run 7zip to extract the archive
            child_process_1.spawnSync(path_1.join(__dirname, "../../../bin/7za.exe"), ["x", pathToArchive, "-y", "-o" + tempDir]);
            // run 7zip to compress to zip
            child_process_1.spawnSync(path_1.join(__dirname, "../../../bin/7za.exe"), ["a", output, "-y", tempDir + "\\*"]);
            // delete the temp directory
            fs_extra_1.removeSync(tempDir);
            ff();
        });
    }
}
exports.default = ArchiveConverter;
//# sourceMappingURL=ArchiveConverter.js.map