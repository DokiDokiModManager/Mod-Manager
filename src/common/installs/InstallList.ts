import {readdirSync, readFileSync} from "fs";
import {join as joinPath} from "path";
import Config from "../files/Config";

export default class InstallList {

    public static getInstallList() {
        const installs: string[] = readdirSync(joinPath(Config.readConfigValue("installFolder"), "installs"));

        return installs.map((install) => {
            const path: string = joinPath(Config.readConfigValue("installFolder"), "installs", install);

            let installData = {"name": ""};

            try {
                installData = JSON.parse(readFileSync(joinPath(path, "install.json")).toString("utf8"));
            } catch (e) {
                installData = install;
            }

            return {
                folderName: install,
                fullFolderName: path,
                installName: installData.name,
            };
        });
    }
}
