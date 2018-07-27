"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const fs_1 = require("fs");
const request = require("request");
const Logger_1 = require("../utilities/Logger");
class DownloadManager extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.queue = [];
    }
    queueDownload(url, saveTo, name, filename) {
        this.queue.push({
            bytes_downloaded: 0,
            filename,
            id: Math.random(),
            name,
            saveTo,
            startTime: Date.now() / 1000,
            status: DownloadStatus.WAITING,
            total_size: 0,
            url,
        });
        this.bumpQueue();
    }
    removeDownload(id) {
        if (this.queue[id].status === DownloadStatus.DOWNLOADING) {
            this.currentDownload.abort();
            fs_1.unlinkSync(this.queue[id].saveTo);
        }
        this.queue.splice(this.queue.findIndex((dl) => dl.id === id), 1);
    }
    getQueue() {
        return this.queue;
    }
    downloadFirstItem() {
        const firstItem = this.queue.filter((dl) => dl.status !== DownloadStatus.DONE)[0];
        this.currentDownload = request({
            headers: {
                "User-Agent": "DokiDokiModManager (u/zuudo)",
            },
            method: "GET",
            url: firstItem.url,
        });
        this.currentDownload.on("response", (response) => {
            firstItem.total_size = parseInt(response.headers["content-length"], 10) || 0;
        }).on("data", (chunk) => {
            firstItem.bytes_downloaded += chunk.length;
            if (firstItem.total_size === 0) {
                this.emit("progress", 2); // indefinite progress bar
            }
            else {
                this.emit("progress", firstItem.bytes_downloaded / firstItem.total_size);
            }
        }).on("complete", () => {
            firstItem.status = DownloadStatus.DONE;
            this.emit("download finished");
            this.emit("progress", 0); // no progress bar
            this.bumpQueue();
        }).pipe(fs_1.createWriteStream(firstItem.saveTo));
    }
    bumpQueue() {
        const firstItem = this.queue.filter((dl) => dl.status !== DownloadStatus.DONE)[0];
        if (!firstItem) {
            return;
        }
        if (firstItem.status === DownloadStatus.WAITING) { // if there is no ongoing downloaded
            Logger_1.default.info("[Downloader] Beginning download of " + firstItem.url);
            firstItem.status = DownloadStatus.DOWNLOADING;
            this.downloadFirstItem(); // start the download
        }
        else if (firstItem.status === DownloadStatus.DONE) {
            Logger_1.default.info("[Downloader] Downloaded " + firstItem.url);
            this.bumpQueue(); // go agane
        }
    }
}
exports.DownloadManager = DownloadManager;
var DownloadStatus;
(function (DownloadStatus) {
    DownloadStatus["DOWNLOADING"] = "downloading";
    DownloadStatus["WAITING"] = "waiting";
    DownloadStatus["DONE"] = "done";
    DownloadStatus["ERROR"] = "error";
})(DownloadStatus = exports.DownloadStatus || (exports.DownloadStatus = {}));
//# sourceMappingURL=DownloadManager.js.map