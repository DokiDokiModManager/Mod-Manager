"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const child_process_1 = require("child_process");
const path_1 = require("path");
const electron_1 = require("electron");
const _7zip_bin_1 = require("7zip-bin");
class ArchiveConverter {
    static convertToZip(pathToArchive, output) {
        return new Promise((ff, rj) => {
            const tempDir = fs_extra_1.mkdtempSync(path_1.join(electron_1.app.getPath("temp"), "ddmm-archive"));
            console.log("Converting " + tempDir);
            // run 7zip to extract the archive
            const extractOut = child_process_1.spawnSync(_7zip_bin_1.path7za, ["x", pathToArchive, "-y", "-o" + tempDir]);
            if (extractOut.error) {
                rj(extractOut.error);
                return;
            }
            if (extractOut.status !== 0) {
                rj(new Error("7-Zip exited with a non-zero exit code (" + extractOut.status + ")"));
                return;
            }
            // run 7zip to compress to zip
            const compressOut = child_process_1.spawnSync(_7zip_bin_1.path7za, ["a", output, "-y", tempDir + "\\*"]);
            if (compressOut.error) {
                rj(compressOut.error);
                return;
            }
            if (compressOut.status !== 0) {
                rj(new Error("7-Zip exited with a non-zero exit code (" + compressOut.status + ")"));
                return;
            }
            // delete the temp directory
            fs_extra_1.removeSync(tempDir);
            ff();
        });
    }
}
exports.default = ArchiveConverter;
//# sourceMappingURL=ArchiveConverter.js.map