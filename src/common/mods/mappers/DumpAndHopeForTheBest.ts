import {join as joinPath} from "path";
import {IModMapper} from "../ModNormaliser";

/*
    A last resort attempt to install a mod by dumping everything in the game folder.
    This won't work most of the time, but it's better than giving up.
 */
export default class DumpAndHopeForTheBest implements IModMapper {

    public mapFile(path: string): string {
        return joinPath("game", path);
    }

    public getFriendlyName(): string {
        return "Zipped Game Folder";
    }
}
