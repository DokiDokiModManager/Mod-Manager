"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("events");
class DownloadManager extends EventEmitter {
    constructor(win) {
        super();
        this.win = win;
        this.saveLocationMap = new Map();
        this.win.webContents.session.on("will-download", (ev, item) => {
            if (!this.saveLocationMap.has(item.getURL())) {
                return;
            }
            console.log("Downloading " + item.getFilename() + " from " + item.getURL());
            item.setSavePath(this.saveLocationMap.get(item.getURL()));
            this.saveLocationMap.delete(item.getURL());
            item.on("updated", (ev, state) => {
                if (state === "progressing") {
                    this.emit("download progress", {
                        filename: item.getFilename(),
                        progress: item.getReceivedBytes() / item.getTotalBytes()
                    });
                }
                else {
                    console.log("Download of " + item.getFilename() + " stalled");
                    this.emit("download stalled", {
                        filename: item.getFilename(),
                        progress: item.getReceivedBytes() / item.getTotalBytes()
                    });
                }
            });
            item.once("done", (ev, state) => {
                if (state === "completed") {
                    console.log("Download of " + item.getFilename() + " complete.");
                    this.emit("download complete", {
                        filename: item.getFilename()
                    });
                }
                else {
                    this.emit("download failed", {
                        filename: item.getFilename()
                    });
                }
            });
        });
    }
    downloadFile(url, saveLocation) {
        this.saveLocationMap.set(url, saveLocation);
        this.win.webContents.downloadURL(url);
    }
}
exports.default = DownloadManager;
//# sourceMappingURL=DownloadManager.js.map