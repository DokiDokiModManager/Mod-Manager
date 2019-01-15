import {existsSync} from "fs";
import {join as joinPath} from "path";
import Config from "../utils/Config";
import DownloadManager from "../net/DownloadManager";
import DDLCDownloader from "../net/DDLCDownloader";
import IntegrityCheck from "./IntegrityCheck";

export default class OnboardingManager {

    private downloadManager: DownloadManager;

    constructor(downloadManager: DownloadManager) {
        this.downloadManager = downloadManager;
    }

    /**
     * Returns true if the user needs to download a copy of DDLC, false otherwise.
     */
    public static requiresOnboarding(): Promise<null> {
        return new Promise((ff, rj) => {
            const path: string = joinPath(Config.readConfigValue("installFolder"), "ddlc.zip");
            if (existsSync(path)) {
                IntegrityCheck.checkGameIntegrity(path).then(() => {
                    ff();
                }).catch(e => {
                    rj(e);
                });
            } else {
                rj("Game does not exist");
            }
        });
    }

    /**
     * Downloads a copy of DDLC and saves it in the install location.
     */
    public downloadGame(): Promise<null> {
        return new Promise((ff, rj) => {
            this.downloadManager.once("download complete", (data: { meta: any, filename: string }) => {
                if (data.meta === "ONBOARDING_DOWNLOAD") {
                    ff();
                }
            });

            this.downloadManager.once("download failed", (data: { meta: any, filename: string }) => {
                if (data.meta === "ONBOARDING_DOWNLOAD") {
                    rj();
                }
            });

            DDLCDownloader.getDownloadLink().then(link => {
                this.downloadManager.downloadFile(link,
                    Config.readConfigValue("installFolder"),
                    "ddlc.zip",
                    "ONBOARDING_DOWNLOAD");
            }).catch(rj);
        });
    }
}