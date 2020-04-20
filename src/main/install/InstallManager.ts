import {remove, emptyDir} from "fs-extra";
import {join as joinPath} from "path";
import Config from "../utils/Config";
import {existsSync, readFileSync, writeFileSync} from "fs";
import Install from "../types/Install";

export default class InstallManager {

    /**
     * Returns whether or not the given install exists (or there is a file/folder with that name)
     * @param folderName The folder/file to check
     */
    public static installExists(folderName: string): boolean {
        return existsSync(joinPath(Config.readConfigValue("installFolder"), "installs", folderName));
    }

    private static updateInstallDataValue(folderName: string, key: string, value: any): Promise<null> {
        return new Promise((ff, rj) => {
            const installDataPath: string = joinPath(Config.readConfigValue("installFolder"), "installs", folderName, "install.json");
            if (existsSync(installDataPath)) {
                const data: Install = JSON.parse(readFileSync(installDataPath, "utf8"));
                data[key] = value;
                writeFileSync(installDataPath, JSON.stringify(data));
                ff();
            } else {
                rj();
            }
        });
    }

    /**
     * Rename an install
     * @param folderName The folder containing the install
     * @param newName The new name for the install
     */
    public static renameInstall(folderName: string, newName: string): Promise<null> {
        return InstallManager.updateInstallDataValue(folderName, "name", newName);
    }

    /**
     * Deletes an install of the game, including save files.
     * @param folderName The folder containing the install
     */
    public static deleteInstall(folderName: string): Promise<null> {
        return new Promise((ff, rj) => {
            const dirPath = joinPath(Config.readConfigValue("installFolder"), "installs", folderName);
            if (existsSync(dirPath)) {
                remove(dirPath).then(() =>  ff()).catch(err => rj(err));
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
                if (process.platform === "win32") {
                    emptyDir(joinPath(dirPath, "appdata")).then(() => ff()).catch(err => rj(err));
                } else if (process.platform === "darwin") {
                    emptyDir(joinPath(dirPath, "appdata", "Library", "RenPy")).then(() => ff()).catch(err => rj(err));
                } else {
                    emptyDir(joinPath(dirPath, "appdata", ".renpy")).then(() => ff()).catch(err => rj(err));
                }
            } else {
                rj(new Error("Install does not exist."))
            }
        });
    }

    /**
     * Sets the category of an install
     * @param folderName The install folder
     * @param category The new category
     */
    public static setCategory(folderName: string, category: string): Promise<null> {
        return InstallManager.updateInstallDataValue(folderName, "category", category);
    }

    /**
     * Sets the MAS export status of an install
     * @param folderName The install folder
     * @param exported Whether or not Monika was exported
     */
    public static setMonikaExported(folderName: string, exported: boolean): Promise<null> {
        return InstallManager.updateInstallDataValue(folderName, "monikaExported", exported);
    }
}
