import {mkdtempSync, removeSync} from "fs-extra";
import {spawnSync} from "child_process";
import {join as joinPath} from "path";
import {app} from "electron";

export default class ArchiveConverter {

    public static convertToZip(pathToArchive: string, output: string) {
        return new Promise((ff, rj) => {
            if (process.platform !== "win32") {
                rj(new Error("Archive convertion is only supported on Windows."));
            }

            const tempDir: string = mkdtempSync(joinPath(app.getPath("temp"), "ddmm-archive"));

            console.log("Converting " + tempDir);

            // run 7zip to extract the archive
            spawnSync(joinPath(__dirname, "../../../bin/7za.exe"), ["x", pathToArchive, "-y", "-o" + tempDir]);

            // run 7zip to compress to zip
            spawnSync(joinPath(__dirname, "../../../bin/7za.exe"), ["a", output, "-y", tempDir + "\\*"]);

            // delete the temp directory
            removeSync(tempDir);

            ff();
        });

    }
}