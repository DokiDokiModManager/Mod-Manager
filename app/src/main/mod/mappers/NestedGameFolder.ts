/*
    A format where the game folder is not in the root of the zip.
    Used by DDLCtVN and others
 */
import {sep as pathSep} from "path";
import {ModMapper} from "../ModMapper";

export default class NestedGameFolder extends ModMapper {

    public mapFile(path: string): string {
        const pathParts = path.split("/");

        if (pathParts[0] === "__MACOSX") return null;

        pathParts[0] = "game";

        return pathParts.join(pathSep);
    }

    public getFriendlyName(): string {
        return "Nested Game Folder";
    }
}
