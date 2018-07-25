import {mkdirsSync} from "fs-extra";
import {join as joinPath} from "path";

export default class DirectoryManager {

    public static createDirs(baseFolder: string) {
        mkdirsSync(joinPath(baseFolder, "mods"));
        mkdirsSync(joinPath(baseFolder, "installs"));
    }
}
