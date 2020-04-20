import {session, DownloadItem} from "electron";
import {join as joinPath} from "path";
import * as EventEmitter from "events";
import Config from "../utils/Config";
import {moveSync} from "fs-extra";

export default class DownloadManager extends EventEmitter {

    private downloads: DownloadItem[] = [];

    constructor() {
        super();

        session.defaultSession.on("will-download", (ev, item: DownloadItem) => {
            console.log(item);

            this.downloads.push(item);

            item.savePath = joinPath(Config.readConfigValue("installFolder"), "downloads", item.getFilename());

            item.on("updated", () => {
                this.emit("updated", item);
            });

            item.on("done", (ev: Event, state) => {
                this.downloads.splice(this.downloads.indexOf(item), 1);
                if (state === "completed") {
                    moveSync(item.savePath, joinPath(Config.readConfigValue("installFolder"), "mods", item.getFilename()));
                    this.emit("finished", item);
                }
                this.emit("updated", item);
            });
        });
    }

    /**
     * Returns whether or not there are downloads in progress
     */
    public hasActiveDownloads(): boolean {
        return this.downloads.length > 0;
    }

    /**
     * Gets all files currently being downloaded
     */
    public getActiveDownloads(): DownloadItem[] {
        return this.downloads;
    }

    /**
     * Downloads a file from a URL
     *
     * @param url The URL to download
     */
    public downloadFile(url: string): void {
        console.log("Beginning download of " + url + " (manual initiation)");
        session.defaultSession.downloadURL(url);
    }
}
