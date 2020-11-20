import {mkdtempSync, removeSync} from "fs-extra";
import {execFileSync, spawnSync, SpawnSyncReturns} from "child_process";
import {join as joinPath, sep as pathSep} from "path";
import {app} from "electron";
import {path7za} from "7zip-bin";
import * as pathUnrar from "unrar-binaries";
import Logger from "../utils/Logger";

export default class ArchiveConverter {

    public static async convertToZip(pathToArchive: string, output: string) {
        const tempDir: string = mkdtempSync(joinPath(app.getPath("temp"), "ddmm-archive"));

        Logger.info("Archive Converter", "Converting " + tempDir + " to a zip file");

        let extractOut: string;

        if (!pathToArchive.endsWith(".rar")) {
            Logger.info("Archive Converter", "Using 7za to convert");

            // run 7zip to extract the archive
            extractOut = execFileSync(path7za, ["x", pathToArchive, "-y", "-o" + tempDir]);
        } else {
            Logger.info("Archive Converter", "Using unrar to convert");

            // run unrar
            extractOut = execFileSync(pathUnrar, ["x", "-y", pathToArchive, tempDir]);
        }

        Logger.debug("Archive Converter", "STDOUT: " + extractOut);

        // run 7zip to compress to zip
        Logger.info("Archive Converter", "Recompressing " + tempDir);
        const compressOut: string = execFileSync(path7za, ["a", output, "-y", tempDir + pathSep + "*"]);

        Logger.debug("Archive Converter", "STDOUT: " + compressOut);

        // delete the temp directory
        removeSync(tempDir);
    }
}
