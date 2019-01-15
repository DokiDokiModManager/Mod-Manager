import {BrowserWindow, DownloadItem} from "electron";
import * as EventEmitter from "events";
import {join as joinPath} from "path";

export default class DownloadManager extends EventEmitter {

    private win: BrowserWindow;

    private downloadCount: number = 0;

    private saveLocationMap: Map<string, string>;
    private filenameMap: Map<string, string>;
    private metadataMap: Map<string, any>;
    private downloadingFileNames: string[];

    constructor(win: BrowserWindow) {
        super();

        this.win = win;

        this.saveLocationMap = new Map();
        this.filenameMap = new Map();
        this.metadataMap = new Map();
        this.downloadingFileNames = [];

        this.win.webContents.session.on("will-download", (ev, item: DownloadItem) => {
            const url: string = item.getURLChain()[0];

            if (!this.saveLocationMap.has(url)) {
                return;
            }

            let filename: string = this.filenameMap.has(url) ? this.filenameMap.get(url) : null;

            if (filename) {
                this.filenameMap.delete(url);
            } else {
                filename = item.getFilename();
            }

            const meta = this.metadataMap.has(url) ? this.metadataMap.get(url) : null;

            if (meta) {
                this.metadataMap.delete(url);
            }

            this.emit("download started", {
                filename: item.getFilename(),
                startTime: item.getStartTime(),
                meta
            });

            console.log("Downloading " + item.getFilename() + " from " + item.getURL());
            item.setSavePath(joinPath(this.saveLocationMap.get(url), filename));
            this.saveLocationMap.delete(url);

            this.downloadingFileNames.push(item.getFilename());

            item.on("updated", (ev, state: string) => {
                if (state === "progressing") {
                    this.emit("download progress", {
                        filename: item.getFilename(),
                        downloaded: item.getReceivedBytes(),
                        total: item.getTotalBytes(),
                        startTime: item.getStartTime(),
                        meta
                    });
                } else {
                    console.log("Download of " + item.getFilename() + " stalled");
                    this.emit("download stalled", {
                        filename: item.getFilename(),
                        downloaded: item.getReceivedBytes(),
                        total: item.getTotalBytes(),
                        startTime: item.getStartTime(),
                        meta
                    });
                }
            });

            item.once("done", (ev, state: string) => {
                this.downloadCount -= 1;
                this.downloadingFileNames.splice(this.downloadingFileNames.indexOf(item.getFilename()), 1);
                if (state === "completed") {
                    console.log("Download of " + item.getFilename() + " complete.");
                    this.emit("download complete", {
                        filename: item.getFilename(),
                        meta
                    });
                } else {
                    this.emit("download failed", {
                        filename: item.getFilename(),
                        meta
                    });
                }
            });
        });
    }

    /**
     * Returns whether or not there are downloads in progress
     */
    public hasDownloads(): boolean {
        return this.downloadCount > 0;
    }

    /**
     * Gets all files currently being downloaded (filenames)
     */
    public getDownloads(): string[] {
        console.log(this.downloadingFileNames);
        return this.downloadingFileNames;
    }

    /**
     * Downloads a file from a URL
     *
     * @param url The URL to download
     * @param saveLocation The path to save the file to
     * @param filename An optional filename
     * @param meta Optional metadata to apply to the download
     */
    public downloadFile(url: string, saveLocation: string, filename?: string, meta?: any): void {
        this.downloadCount += 1;
        this.saveLocationMap.set(url, saveLocation);
        this.filenameMap.set(url, filename);
        this.metadataMap.set(url, meta);
        this.win.webContents.downloadURL(url);
    }
}