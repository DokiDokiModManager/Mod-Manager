import {readdirSync} from "fs";
import {join as joinPath} from "path";
import Config from "../utils/Config";

export default class ModList {

    /**
     * Reads the mod directory and returns the contents (filtered to only include .zip files)
     * @returns string[] A list of mod filenames
     */
    static getModList(): string[] {
        const modFolder: string = joinPath(Config.readConfigValue("installFolder"), "mods");

        return readdirSync(modFolder).filter(fn => {
            return ["zip", "rar", "7z", "gz"].filter(ext => fn.endsWith("." + ext)).length > 0;
        });
    }
}