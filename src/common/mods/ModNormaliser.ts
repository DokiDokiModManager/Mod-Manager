import * as unzip from "@zudo/unzipper";

import DumpAndHopeForTheBest from "./mappers/DumpAndHopeForTheBest";
import InstallAppropriateFiles from "./mappers/InstallAppropriateFiles";
import ModManagerFormat from "./mappers/ModManagerFormat";
import ModTemplateFormat from "./mappers/ModTemplateFormat";

/*
    This script is intended to take any zip file and try and determine how DDMM should install it, if it is a mod.
    There's so many different ways mods are packaged, so this won't cover every scenario, but DDMM will allow the user
    to install a mod manually if this fails.
 */

/*
    Looks at the file structure of the zip file and attempts to determine what the format of the mod is.
 */
export function inferMapper(zipPath: string): Promise<IModMapper> {
    return new Promise((ff, rj) => {
        const zip = unzip(zipPath);
        const structure = [];

        zip.on("file", (file) => {
            structure.push(file.path);
        });

        zip.on("directory", (dir) => {
            structure.push(dir.path);
        });

        zip.on("close", () => {
            if (structure.indexOf("mod.json") !== -1 || structure.indexOf("game/") !== -1) {
                ff(new ModManagerFormat());
                return;
            }

            let isModTemplate: boolean = false;
            let onlyRenpy: boolean = true;

            for (const path of structure) {
                const pathParts = path.split("/");

                if (pathParts[1] === "game") {
                    isModTemplate = true;
                }

                if (!path.match(/\.rp(y|yc|a)$/)) {
                    onlyRenpy = false;
                }
            }

            if (isModTemplate) {
                ff(new ModTemplateFormat());
            } else if (!onlyRenpy) {
                ff(new DumpAndHopeForTheBest());
            } else {
                ff(new InstallAppropriateFiles());
            }
        });
    });
}

export interface IModMapper {
    mapFile(path: string): string;

    getFriendlyName(): string;
}
