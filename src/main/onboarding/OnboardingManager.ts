import {existsSync} from "fs";
import {join as joinPath} from "path";
import Config from "../utils/Config";
import DownloadManager from "../net/DownloadManager";
import * as EventEmitter from "events";
import DDLCDownloader from "../net/DDLCDownloader";

export default class OnboardingManager extends EventEmitter {

    private downloadManager: DownloadManager;

    constructor(downloadManager: DownloadManager) {
        super();
        this.downloadManager = downloadManager;
    }

    /**
     * Returns true if the user needs to download a copy of DDLC, false otherwise.
     */
    public static requiresOnboarding(): boolean {
        return !existsSync(joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"));
    }

    /**
     * Downloads a copy of DDLC and saves it in the install location.
     */
    public downloadGame(): Promise<null> {
        return new Promise((ff, rj) => {
            this.downloadManager.once("download complete", (data: {meta: any, filename: string}) => {
                if (data.meta === "ONBOARDING_DOWNLOAD") {
                    ff();
                }
            });

            this.downloadManager.once("download failed", (data: {meta: any, filename: string}) => {
                if (data.meta === "ONBOARDING_DOWNLOAD") {
                    rj();
                }
            });

            DDLCDownloader.getDownloadLink().then(link => {
                this.downloadManager.downloadFile(link,
                    joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"),
                    "ONBOARDING_DOWNLOAD");
            }).catch(rj);
        });
    }
}