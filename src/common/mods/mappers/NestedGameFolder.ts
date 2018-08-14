/*
    A dodgy format where the game folder is not in the root of the zip.
    Used by DDLCtVN
 */
import {sep as pathSep} from "path";
import {ModMapper} from "../ModMapper";

export default class NestedGameFolder extends ModMapper {

    public mapFile(path: string): string {
        const pathParts = path.split("/");

        pathParts[0] = "game";

        return pathParts.join(pathSep);
    }

    public getFriendlyName(): string {
        return "Nested Game Folder";
    }
}
