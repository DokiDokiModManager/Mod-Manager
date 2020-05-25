import {session, DownloadItem, BrowserWindow, dialog} from "electron";
import {join as joinPath} from "path";
import * as EventEmitter from "events";
import Config from "../utils/Config";
import {moveSync, existsSync} from "fs-extra";
import I18n from "../i18n/i18n";

export default class DownloadManager extends EventEmitter {

    private downloads: DownloadItem[] = [];

    private filenames: Map<string, string> = new Map();

    private interactionWin: BrowserWindow;

    private readonly lang: I18n;
    private readonly mainWin: BrowserWindow;

    constructor(mainWin: BrowserWindow, lang: I18n) {
        super();
        this.lang = lang;
        this.mainWin = mainWin;

        session.defaultSession.on("will-download", (ev, item: DownloadItem) => {
            this.downloads.push(item);

            if (this.interactionWin) {
                this.interactionWin.close();
            }

            const filename: string = this.filenames.get(item.getURLChain()[0]) || item.getFilename();
            const newPath: string = joinPath(Config.readConfigValue("installFolder"), "mods", filename);

            if (existsSync(newPath)) {
                if (dialog.showMessageBoxSync(mainWin, {
                    message: this.lang.translate("main.redownload_confirmation.message"),
                    detail: this.lang.translate("main.redownload_confirmation.detail", filename),
                    buttons: [this.lang.translate("main.redownload_confirmation.button_confirm"), this.lang.translate("main.redownload_confirmation.button_cancel")],
                    type: "warning"
                }) !== 0) {
                    item.cancel();
                    return;
                }
            }

            this.emit("started", item.getURLChain()[0]);

            item.savePath = joinPath(Config.readConfigValue("installFolder"), "downloads", filename);

            item.on("updated", () => {
                this.emit("updated", item);
            });

            item.on("done", (ev: Event, state) => {
                this.downloads.splice(this.downloads.indexOf(item), 1);
                if (state === "completed") {
                    this.filenames.delete(item.getURLChain()[0]);
                    moveSync(item.savePath, newPath, {
                        overwrite: true
                    });
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

    /**
     * Downloads a file from a URL by showing it in a new window
     *
     * @param url The URL to download
     */
    public downloadFileWithInteraction(url: string) {
        this.interactionWin = new BrowserWindow({
            parent: this.mainWin,
            modal: true,
            show: false,
            webPreferences: {
                nodeIntegration: false,
            }
        });

        this.interactionWin.setMenu(null);

        this.interactionWin.on("close", () => {
            this.interactionWin = null;
        });

        this.interactionWin.on("ready-to-show", () => {
            this.interactionWin.show();
        });

        this.interactionWin.webContents.on("new-window", event => {
            event.preventDefault();
        });

        this.interactionWin.loadURL(url);
    }
}
