import {readdirSync} from "fs";
import {join as joinPath} from "path";
import Config from "../utils/Config";
import Logger from "../utils/Logger";

export default class ModList {
    /**
     * Reads the mod directory and returns the contents (filtered to only include archive files)
     * @returns string[] A list of mod filenames
     */
    public getModList(): string[] {
        const modFolder: string = joinPath(Config.readConfigValue("installFolder"), "mods");

        Logger.info("Mod List", "Reading mods from " + modFolder);

        try {
            return readdirSync(modFolder).filter(fn => {
                return ["rpa", "zip", "rar", "7z"].filter(ext => fn.endsWith("." + ext)).length > 0;
            });
        } catch (e) {
            Logger.warn("Mod List", "Failed to read mods folder");
            console.warn(e);
            return [];
        }
    }
}
