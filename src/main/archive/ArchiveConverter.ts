import {mkdtempSync, removeSync} from "fs-extra";
import {spawnSync, SpawnSyncReturns} from "child_process";
import {join as joinPath} from "path";
import {app} from "electron";
import {path7za} from "7zip-bin";
import Logger from "../utils/Logger";

export default class ArchiveConverter {

    public static convertToZip(pathToArchive: string, output: string) {
        return new Promise((ff, rj) => {
            const tempDir: string = mkdtempSync(joinPath(app.getPath("temp"), "ddmm-archive"));

            Logger.info("Archive Converter", "Converting " + tempDir + " to a zip file");

            // run 7zip to extract the archive
            const extractOut: SpawnSyncReturns<string> = spawnSync(path7za, ["x", pathToArchive, "-y", "-o" + tempDir]);

            if (extractOut.error) { rj(extractOut.error); return; }
            if (extractOut.status !== 0) { rj(new Error("7-Zip exited with a non-zero exit code (" + extractOut.status + ")")); return; }

            // run 7zip to compress to zip
            const compressOut: SpawnSyncReturns<string> = spawnSync(path7za, ["a", output, "-y", tempDir + "\\*"]);

            if (compressOut.error) { rj(compressOut.error); return; }
            if (compressOut.status !== 0) { rj(new Error("7-Zip exited with a non-zero exit code (" + compressOut.status + ")")); return; }

            // delete the temp directory
            removeSync(tempDir);

            ff();
        });

    }
}
