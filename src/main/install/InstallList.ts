import {app} from "electron";
import {join as joinPath} from "path";
import {existsSync, readdirSync, readFileSync} from "fs";
import Install from "../types/Install";
import Config from "../utils/Config";
import I18n from "../i18n/i18n";
import {MonikaExportStatus} from "../types/MonikaExportStatus";
import Logger from "../utils/Logger";
import * as du from "du";

const lang: I18n = new I18n();

export default class InstallList {

    /**
     * Reads the install directory and returns information on each install
     * @returns Install[] a list of installs
     */
    static async getInstallList(): Promise<Install[]> {
        // find and read the folders
        const installFolder: string = joinPath(Config.readConfigValue("installFolder"), "installs");

        Logger.info("Install List", "Reading installs from " + installFolder);

        let installs: string[];

        try {
            installs = readdirSync(installFolder);
        } catch (e) {
            return [];
        }

        let returned: Install[] = [];

        for (let folder of installs) {
            const folderPath: string = joinPath(installFolder, folder);
            const dataFilePath: string = joinPath(folderPath, "install.json");

            try {
                const fileContents: string = readFileSync(dataFilePath, "utf8");
                const data: any = JSON.parse(fileContents);

                let screenshots: string[];

                try {
                    screenshots = readdirSync(joinPath(installFolder, folder, "install")).filter(fn => {
                        return fn.match(/^screenshot(\d+)\.png$/);
                    });
                } catch (e) {
                    screenshots = [];
                }

                let monikaExportStatus: MonikaExportStatus;

                if (existsSync(joinPath(installFolder, folder, "install", "characters", "monika"))) {
                    monikaExportStatus = MonikaExportStatus.ReadyToExport;
                } else {
                    monikaExportStatus = data.monikaExported ? MonikaExportStatus.Exported : MonikaExportStatus.NotExported;
                }

                const size: number = await du(folderPath);


                if (data.name) {
                    returned.push({
                        name: data.name,
                        folderName: folder,
                        globalSave: data.globalSave,
                        screenshots: screenshots,
                        achievements: data.achievements,
                        mod: data.mod,
                        playTime: data.playTime || 0,
                        category: data.category,
                        monikaExportStatus,
                        archived: data.archived,
                        size
                    });
                }
            } catch (e) {
                Logger.warn("Install List", "Failed to read install data from " + dataFilePath);
                console.warn(e);
                // do nothing, the folder should be ignored
            }
        }

        if (process.platform === "win32") {
            app.setUserTasks(returned.map((install: Install) => {
                return {
                    program: process.execPath,
                    arguments: "ddmm://launch-install/" + install.folderName,
                    iconPath: process.execPath,
                    iconIndex: 0,
                    title: install.name,
                    description: lang.translate("main.jumplist.task_launch", install.name)
                };
            }));
        }

        return returned;
    }
}
