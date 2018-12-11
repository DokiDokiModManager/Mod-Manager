import {BrowserWindow, DownloadItem} from "electron";
import * as EventEmitter from "events";

export default class DownloadManager extends EventEmitter {

    private win: BrowserWindow;

    private saveLocationMap: Map<string, string>;

    constructor(win: BrowserWindow) {
        super();

        this.win = win;

        this.saveLocationMap = new Map();

        this.win.webContents.session.on("will-download", (ev, item: DownloadItem) => {
            if (!this.saveLocationMap.has(item.getURL())) {
                return;
            }

            console.log("Downloading " + item.getFilename() + " from " + item.getURL());
            item.setSavePath(this.saveLocationMap.get(item.getURL()));
            this.saveLocationMap.delete(item.getURL());

            item.on("updated", (ev, state: string) => {
                if (state === "progressing") {
                    this.emit("download progress", {
                        filename: item.getFilename(),
                        progress: item.getReceivedBytes() / item.getTotalBytes()
                    });
                } else {
                    console.log("Download of " + item.getFilename() + " stalled");
                    this.emit("download stalled", {
                        filename: item.getFilename(),
                        progress: item.getReceivedBytes() / item.getTotalBytes()
                    })
                }
            });

            item.once("done", (ev, state: string) => {
               if (state === "completed") {
                   console.log("Download of " + item.getFilename() + " complete.");
                   this.emit("download complete", {
                       filename: item.getFilename()
                   });
               } else {
                    this.emit("download failed", {
                       filename: item.getFilename()
                    });
               }
            });
        });
    }

    public downloadFile(url: string, saveLocation: string): void {
        this.saveLocationMap.set(url, saveLocation);
        this.win.webContents.downloadURL(url);
    }
}