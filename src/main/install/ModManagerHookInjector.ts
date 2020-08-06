import {copyFile} from "fs";
import {join as joinPath} from "path";
import Config from "../utils/Config";

export default class ModManagerHookInjector {

    public static injectScript(installName: string) {
        return new Promise((ff, rj) => {
            copyFile(
                joinPath(process.resourcesPath, "../ddmm.rpy"),
                joinPath(Config.readConfigValue("installFolder"), "installs", installName, "install", "game", "ddmm.rpy"),
                err => {
                    if (err) rj(err);
                    else ff();
                }
            );
        });
    }
}
