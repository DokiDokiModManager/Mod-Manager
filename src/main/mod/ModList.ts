import {readdirSync} from "fs";
import {join as joinPath} from "path";
import Config from "../utils/Config";
import DownloadManager from "../net/DownloadManager";

export default class ModList {

    private readonly downloadManager: DownloadManager;

    constructor(downloadManager: DownloadManager) {
        this.downloadManager = downloadManager;
    }

    /**
     * Reads the mod directory and returns the contents (filtered to only include archive files)
     * @returns string[] A list of mod filenames
     */
    public getModList(): {filename: string, downloading: boolean}[] {
        const modFolder: string = joinPath(Config.readConfigValue("installFolder"), "mods");

        console.log("Reading mods from " + modFolder);

        const downloads: string[] = this.downloadManager.getDownloads();

        return readdirSync(modFolder).filter(fn => {
            return ["zip", "rar", "7z", "gz"].filter(ext => fn.endsWith("." + ext)).length > 0;
        }).map(fn => {
            return {
                filename: fn,
                downloading: downloads.indexOf(fn) !== -1
            };
        });
    }
}