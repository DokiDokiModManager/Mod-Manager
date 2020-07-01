import {session, DownloadItem, BrowserWindow, dialog, Event} from "electron";
import {join as joinPath} from "path";
import * as EventEmitter from "events";
import Config from "../utils/Config";
import {moveSync, existsSync} from "fs-extra";
import I18n from "../i18n/i18n";
import Logger from "../utils/Logger";

export default class DownloadManager extends EventEmitter {

    private downloads: DownloadItem[] = [];

    private interactionWin: BrowserWindow;

    private preloadedFileName: string;

    private readonly lang: I18n;
    private readonly mainWin: BrowserWindow;

    constructor(mainWin: BrowserWindow, lang: I18n) {
        super();
        this.lang = lang;
        this.mainWin = mainWin;

        session.defaultSession.on("will-download", (ev: Event, item: DownloadItem) => {
            this.downloads.push(item);

            if (this.interactionWin) {
                this.interactionWin.close();
            }

            const filename: string = this.preloadedFileName ? (this.preloadedFileName + "." + item.getFilename().split(".").pop())  : item.getFilename();
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
        return this.downloads.filter(item => !!item);
    }

    /**
     * Downloads a file from a URL
     *
     * @param url The URL to download
     */
    public downloadFile(url: string): void {
        Logger.info("Download Manager", "Beginning download of " + url + " (manual initiation)");
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

    /**
     * Preloads a file name, so the next download gets that instead of the file name provided on download
     * @param name The name, or null
     */
    public preloadFilename(name?: string) {
        this.preloadedFileName = name ? name.replace(/[*"\/\\<>\[\]:;|,]/g, " ") : null;
        Logger.info("Download Manager", name ? "Preloaded filename " + this.preloadedFileName + " for downloads." : "No longer preloading a filename");
    }
}
