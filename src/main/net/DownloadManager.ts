import {BrowserWindow, DownloadItem} from "electron";
import * as EventEmitter from "events";

export default class DownloadManager extends EventEmitter {

    private win: BrowserWindow;

    private downloadCount: number = 0;

    private saveLocationMap: Map<string, string>;
    private metadataMap: Map<string, any>;

    constructor(win: BrowserWindow) {
        super();

        this.win = win;

        this.saveLocationMap = new Map();
        this.metadataMap = new Map();

        this.win.webContents.session.on("will-download", (ev, item: DownloadItem) => {
            if (!this.saveLocationMap.has(item.getURL())) {
                return;
            }

            const meta = this.metadataMap.has(item.getURL()) ? this.metadataMap.get(item.getURL()) : null;

            if (meta) {
                this.metadataMap.delete(item.getURL());
            }

            console.log("Downloading " + item.getFilename() + " from " + item.getURL());
            item.setSavePath(this.saveLocationMap.get(item.getURL()));
            this.saveLocationMap.delete(item.getURL());

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
                    })
                }
            });

            item.once("done", (ev, state: string) => {
                this.downloadCount -= 1;
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
     * Downloads a file from a URL
     *
     * @param url The URL to download
     * @param saveLocation The path to save the file to
     * @param meta Optional metadata to apply to the download
     */
    public downloadFile(url: string, saveLocation: string, meta?: any): void {
        this.downloadCount += 1;
        this.saveLocationMap.set(url, saveLocation);
        this.metadataMap.set(url, meta);
        this.win.webContents.downloadURL(url);
    }
}