import {EventEmitter} from "events";
import {createWriteStream} from "fs";
import * as request from "request";
import Logger from "../utilities/Logger";

export class DownloadManager extends EventEmitter {

    private queue: IDownload[] = [];

    public queueDownload(url: string, saveTo: string, name: string, filename?: string) {
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

    public removeDownload(id: number) {
        this.queue.splice(this.queue.findIndex((dl) => dl.id === id), 1);
    }

    public getQueue() {
        return this.queue;
    }

    private downloadFirstItem() {
        const firstItem: IDownload = this.queue.filter((dl) => dl.status !== DownloadStatus.DONE)[0];

        request({
            headers: {
                "User-Agent": "DokiDokiModManager (u/zuudo)",
            },
            method: "GET",
            url: firstItem.url,
        }).on("response", (response) => {
            firstItem.total_size = parseInt(response.headers["content-length"], 10);
        }).on("data", (chunk) => {
            firstItem.bytes_downloaded += chunk.length;

            if (firstItem.total_size === 0) {
                this.emit("progress", 2); // indefinite progress bar
            } else {
                this.emit("progress", firstItem.bytes_downloaded / firstItem.total_size);
            }

            if (firstItem.bytes_downloaded >= firstItem.total_size) {
                firstItem.status = DownloadStatus.DONE;

                this.emit("download finished");
                this.emit("progress", 0); // no progress bar

                this.bumpQueue();
            }
        }).pipe(createWriteStream(firstItem.saveTo));
    }

    private bumpQueue() {
        const firstItem: IDownload = this.queue.filter((dl) => dl.status !== DownloadStatus.DONE)[0];

        if (!firstItem) {
            return;
        }

        if (firstItem.status === DownloadStatus.WAITING) { // if there is no ongoing downloaded
            Logger.info("[Downloader] Beginning download of " + firstItem.url);
            firstItem.status = DownloadStatus.DOWNLOADING;
            this.downloadFirstItem(); // start the download
        } else if (firstItem.status === DownloadStatus.DONE) {
            Logger.info("[Downloader] Downloaded " + firstItem.url);
            this.bumpQueue(); // go agane
        }
    }
}

export interface IDownload {
    readonly url: string;
    readonly saveTo: string;
    name: string;
    filename?: string;
    status: DownloadStatus;
    bytes_downloaded: number;
    total_size: number;
    id: number;
    startTime: number;
}

export enum DownloadStatus {
    DOWNLOADING = "downloading",
    WAITING = "waiting",
    DONE = "done",
    ERROR = "error",
}
