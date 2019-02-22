import {join as joinPath, sep as pathSep} from "path";
import {app} from "electron";
import {randomBytes} from "crypto";
import * as request from "request";
import * as unzip from "@zudo/unzipper";
import {createWriteStream, readdirSync, emptyDirSync, mkdirsSync, removeSync} from "fs-extra";
import Config from "../utils/Config";
import * as archiver from "archiver";

export default class InstallSync {

    /**
     * Install the save data from Firebase into an existing install
     * @param folderName The folder name
     * @param saveDataURL The URL
     */
    public static installSaveData(folderName: string, saveDataURL: string): Promise<void> {
        return new Promise((ff, rj) => {
            const tempZipPath: string = joinPath(app.getPath("temp"), "ddmm" + randomBytes(8).toString("hex") + ".zip");

            request(saveDataURL).pipe(createWriteStream(tempZipPath)).on("close", () => {
                // mod is downloaded

                let saveDataPath: string = joinPath(Config.readConfigValue("installFolder"), "installs", folderName, "appdata");

                if (process.platform === "win32") {
                    saveDataPath = joinPath(saveDataPath, "RenPy");
                } else if (process.platform === "darwin") {
                    saveDataPath = joinPath(saveDataPath, "Library", "RenPy");
                } else {
                    saveDataPath = joinPath(saveDataPath, ".renpy");
                }

                emptyDirSync(saveDataPath); // clear the folder

                const zip = unzip(tempZipPath);

                zip.on("file", file => {
                    const pathParts = file.path.split("/");

                    const fileName = pathParts.pop();
                    mkdirsSync(joinPath(saveDataPath, pathParts.join(pathSep)));

                    console.log(joinPath(saveDataPath, pathParts.join(pathSep)));

                    // write the file
                    file.openStream((err, stream) => {
                        if (err) {
                            rj(err);
                        }
                        stream.pipe(createWriteStream(joinPath(
                            saveDataPath,
                            pathParts.join(pathSep), fileName)));
                    });
                });

                zip.on("close", () => {
                    removeSync(tempZipPath);
                    ff();
                });
            }).on("error", err => {
                console.warn(err);
                rj(err);
            });
        });
    }

    /**
     * Compresses the save data of a mod into a .zip and returns the path
     * @param folderName The folder name
     */
    public static compressSaveData(folderName: string): Promise<string> {
        return new Promise((ff, rj) => {
            const tempZipPath: string = joinPath(app.getPath("temp"), "ddmm" + randomBytes(8).toString("hex") + ".zip");

            let saveDataPath: string = joinPath(Config.readConfigValue("installFolder"), "installs", folderName, "appdata");

            if (process.platform === "win32") {
                saveDataPath = joinPath(saveDataPath, "RenPy");
            } else if (process.platform === "darwin") {
                saveDataPath = joinPath(saveDataPath, "Library", "RenPy");
            } else {
                saveDataPath = joinPath(saveDataPath, ".renpy");
            }

            const output = createWriteStream(tempZipPath);
            const zip = archiver("zip");

            output.on("close", () => {
                ff(tempZipPath);
            });

            zip.on("error", err => {
                rj(err);
            });

            zip.pipe(output);
            zip.directory(saveDataPath, false);
            zip.finalize();
        });
    }
}