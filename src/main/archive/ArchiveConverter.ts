import {mkdtempSync, removeSync} from "fs-extra";
import {spawnSync, SpawnSyncReturns} from "child_process";
import {join as joinPath, sep as pathSep} from "path";
import {app} from "electron";
import {path7za} from "7zip-bin";
import * as pathUnrar from "unrar-binaries";
import Logger from "../utils/Logger";
import {chmodSync} from "fs";

export default class ArchiveConverter {

    public static async convertToZip(pathToArchive: string, output: string) {
        const tempDir: string = mkdtempSync(joinPath(app.getPath("temp"), "ddmm-archive"));

        Logger.info("Archive Converter", "Converting " + tempDir + " to a zip file");

        let extractOut: SpawnSyncReturns<string>;

        if (!pathToArchive.endsWith(".rar")) {
            Logger.info("Archive Converter", "Using 7za to convert");

            // run 7zip to extract the archive
            extractOut = spawnSync(path7za, ["x", pathToArchive, "-y", "-o" + tempDir]);
        } else {
            Logger.info("Archive Converter", "Using unrar to convert");

            // run unrar
            if (process.platform !== "win32") {
                chmodSync(pathUnrar, 0o774);
            }
            extractOut = spawnSync(pathUnrar, ["x", "-y", pathToArchive, tempDir]);
        }

        Logger.debug("Archive Converter", "STDOUT: " + extractOut.stdout);
        Logger.debug("Archive Converter", "STDERR: " + extractOut.status);

        if (extractOut.error) {
            throw extractOut.error;
        }
        if (extractOut.status !== 0) {
            throw new Error("7-Zip or unrar exited with a non-zero exit code (" + extractOut.status + ")");
        }

        // run 7zip to compress to zip
        Logger.info("Archive Converter", "Recompressing " + tempDir);
        const compressOut: SpawnSyncReturns<string> = spawnSync(path7za, ["a", output, "-y", tempDir + pathSep + "*"]);

        Logger.debug("Archive Converter", "STDOUT: " + compressOut.stdout);
        Logger.debug("Archive Converter", "STDERR: " + compressOut.status);

        if (compressOut.error) {
            throw compressOut.error;
        }
        if (compressOut.status !== 0) {
            throw new Error("7-Zip exited with a non-zero exit code (" + compressOut.status + ")");
        }

        // delete the temp directory
        removeSync(tempDir);
    }
}
