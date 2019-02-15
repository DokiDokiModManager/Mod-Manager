import {app} from "electron";
import {join as joinPath} from "path";
import {readdirSync, readFileSync} from "fs";
import Install from "../types/Install";
import Config from "../utils/Config";
import I18n from "../utils/i18n";

const lang: I18n = new I18n(app.getLocale());

export default class InstallList {

    /**
     * Reads the install directory and returns information on each install
     * @returns Install[] a list of installs
     */
    static getInstallList(): Install[] {
        // find and read the folders
        const installFolder: string = joinPath(Config.readConfigValue("installFolder"), "installs");

        console.log("Reading installs from " + installFolder);

        const installs = readdirSync(installFolder);
        let returned: Install[] = [];

        for (let folder of installs) {
            const dataFilePath: string = joinPath(installFolder, folder, "install.json");

            try {
                const fileContents: string = readFileSync(dataFilePath, "utf8");
                const data: any = JSON.parse(fileContents);

                let screenshots: string[] = [];

                try {
                    screenshots = readdirSync(joinPath(installFolder, folder, "install")).filter(fn => {
                        return fn.match(/^screenshot(\d+)\.png$/);
                    });
                } catch (e) {
                    console.log("Could not load screenshots due to an IO error", e.message);
                }

                if (data.name) {
                    returned.push(new Install(data.name, folder, data.globalSave, screenshots, data.achievements, data.mod));
                }
            } catch (e) {
                console.info("Failed to read install data from " + dataFilePath, e.message);
                console.log("Ignoring the folder.");
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