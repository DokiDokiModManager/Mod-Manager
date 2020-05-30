import {mkdtempSync, removeSync} from "fs-extra";
import {spawnSync, SpawnSyncReturns} from "child_process";
import {join as joinPath} from "path";
import {app} from "electron";
import {path7za} from "7zip-bin";
import {unrar} from "unrar-promise";
import Logger from "../utils/Logger";

export default class ArchiveConverter {

    public static async convertToZip(pathToArchive: string, output: string) {
        const tempDir: string = mkdtempSync(joinPath(app.getPath("temp"), "ddmm-archive"));

        Logger.info("Archive Converter", "Converting " + tempDir + " to a zip file");

        if (!pathToArchive.endsWith(".rar")) {
            Logger.info("Archive Converter", "Using 7za to convert");

            // run 7zip to extract the archive
            const extractOut: SpawnSyncReturns<string> = spawnSync(path7za, ["x", pathToArchive, "-y", "-o" + tempDir]);

            if (extractOut.error) {
                throw extractOut.error;
            }
            if (extractOut.status !== 0) {
                throw new Error("7-Zip exited with a non-zero exit code (" + extractOut.status + ")");
            }
        } else {
            Logger.info("Archive Converter", "Using unrar to convert");

            await unrar(pathToArchive, tempDir)
        }

        // run 7zip to compress to zip
        const compressOut: SpawnSyncReturns<string> = spawnSync(path7za, ["a", output, "-y", tempDir + "\\*"]);

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
