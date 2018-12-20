import {remove, emptyDir} from "fs-extra";
import {join as joinPath} from "path";
import Config from "../utils/Config";
import {existsSync} from "fs";

export default class InstallManager {

    /**
     * Returns whether or not the given install exists (or there is a file/folder with that name)
     * @param folderName The folder/file to check
     */
    public static installExists(folderName: string): boolean {
        return existsSync(joinPath(Config.readConfigValue("installFolder"), "installs", folderName));
    }

    /**
     * Deletes an install of the game, including save files.
     * @param folderName The folder containing the install
     */
    public static deleteInstall(folderName: string): Promise<null> {
        return new Promise((ff, rj) => {
            const dirPath = joinPath(Config.readConfigValue("installFolder"), "installs", folderName);
            if (existsSync(dirPath)) {
                remove(dirPath).then(ff).catch(rj);
            } else {
                rj(new Error("Install does not exist."))
            }
        });
    }

    /**
     * Deletes the save file of an install.
     * @param folderName The folder containing the install
     */
    public static deleteSaveData(folderName: string): Promise<null> {
        return new Promise((ff, rj) => {
            const dirPath = joinPath(Config.readConfigValue("installFolder"), "installs", folderName);
            if (existsSync(dirPath)) {
                emptyDir(joinPath(dirPath, "appdata")).then(ff).catch(rj);
            } else {
                rj(new Error("Install does not exist."))
            }
        });
    }
}