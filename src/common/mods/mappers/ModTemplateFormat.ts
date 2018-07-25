import {sep as pathSep} from "path";
import {IModMapper} from "../ModNormaliser";

/*
    This name isn't quite accurate. It actually works with any mod that has one folder in the root of the zip file,
    then the game, characters etc in that folder. As therationalpi's mod template exports to this format, it seems like
    a good name.
 */
export default class ModTemplateFormat implements IModMapper {

    public mapFile(path: string): string {
        const pathParts = path.split("/");
        const baseFolder = pathParts.shift();

        if (pathParts[0] === "game" || pathParts[0] === "characters") {
            return pathParts.join(pathSep);
        }

        return null; // ignore it
    }

    public getFriendlyName(): string {
        return "Mod (DDLC Mod Template)";
    }

}
