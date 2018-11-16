import {readdirSync} from "fs";
import {join as joinPath} from "path";
import Config from "./config";

export default class ModList {

    /**
     * Reads the mod directory and returns the contents
     * @returns string[] A list of mod filenames
     */
    static getModList(): string[] {
        const modFolder: string = joinPath(Config.readConfigValue("installFolder"), "mods");

        return readdirSync(modFolder);
    }
}