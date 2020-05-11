import {readdirSync} from "fs";
import {join as joinPath} from "path";
import Config from "../utils/Config";
import DownloadManager from "../net/DownloadManager";
import DownloadItem = Electron.DownloadItem;

export default class ModList {

    private readonly downloadManager: DownloadManager;

    constructor(downloadManager: DownloadManager) {
        this.downloadManager = downloadManager;
    }

    /**
     * Reads the mod directory and returns the contents (filtered to only include archive files)
     * @returns string[] A list of mod filenames
     */
    public getModList(): string[] {
        const modFolder: string = joinPath(Config.readConfigValue("installFolder"), "mods");

        console.log("Reading mods from " + modFolder);

        try {
            return readdirSync(modFolder).filter(fn => {
                return ["zip", "rar", "7z", "gz"].filter(ext => fn.endsWith("." + ext)).length > 0;
            });
        } catch (e) {
            return [];
        }
    }
}
