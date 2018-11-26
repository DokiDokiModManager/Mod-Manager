import {join as joinPath} from "path";
import {ModMapper} from "../ModMapper";

/*
    Take files and put them in their appropriate directories.
    rpy / rpyc / rpa files go in the game folder, whereas chr files go in the characters folder.
    This won't work a lot of the time, but at least it's not "dump and hope for the best".
    Wait, that's a thing too!
 */
export default class InstallAppropriateFiles extends ModMapper {

    public mapFile(path: string): string {
        const filename: string = path.split("/").pop();
        if (filename.match(/\.rp(y|yc|a)$/)) { // it is a ren'py file
            return joinPath("game", filename);
        } else if (filename.match(/\.chr$/)) { // it is a character file
            return joinPath("characters", filename);
        }

        return null; // ignore it
    }

    public getFriendlyName(): string {
        return "Unsorted Game Files";
    }
}