import {session, DownloadItem} from "electron";
import {join as joinPath} from "path";
import * as EventEmitter from "events";
import Config from "../utils/Config";
import {moveSync} from "fs-extra";

export default class DownloadManager extends EventEmitter {

    private downloads: DownloadItem[] = [];

    private filenames: Map<string, string> = new Map();

    constructor() {
        super();

        session.defaultSession.on("will-download", (ev, item: DownloadItem) => {
            this.downloads.push(item);

            const filename: string = this.filenames.get(item.getURLChain()[0]) || item.getFilename();
            item.savePath = joinPath(Config.readConfigValue("installFolder"), "downloads", filename);

            item.on("updated", () => {
                this.emit("updated", item);
            });

            item.on("done", (ev: Event, state) => {
                this.downloads.splice(this.downloads.indexOf(item), 1);
                if (state === "completed") {
                    this.filenames.delete(item.getURLChain()[0]);
                    moveSync(item.savePath, joinPath(Config.readConfigValue("installFolder"), "mods", filename));
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
     * Gets the custom filename for a downloading file, if it was set.
     * @param url The URL being downloaded.
     */
    public getSavedFilename(url: string): string {
        return this.filenames.get(url);
    }

    /**
     * Downloads a file from a URL
     *
     * @param url The URL to download
     * @param filename An optional file name
     */
    public downloadFile(url: string, filename?: string): void {
        console.log("Beginning download of " + url + " (manual initiation)");
        if (filename) {
            this.filenames.set(url, filename);
        }
        session.defaultSession.downloadURL(url);
    }
}
