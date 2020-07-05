import {sep as pathSep} from "path";
import {ModMapper} from "../ModMapper";

/*
    This name isn't quite accurate. It actually works with any mod that has one folder in the root of the zip file,
    then the game, characters etc in that folder. As therationalpi's mod template exports to this format, it seems like
    a good name.
 */
export default class ModTemplateFormat extends ModMapper {

    public mapFile(path: string): string {
        const pathParts = path.split("/");
        pathParts.shift();

        if (pathParts[0] === "game" || pathParts[0] === "characters" || pathParts[0] === "renpy" || pathParts[0] === "lib") {
            return pathParts.join(pathSep);
        }

        return null; // ignore it
    }

    public getFriendlyName(): string {
        return "Mod (DDLC Mod Template)";
    }

}