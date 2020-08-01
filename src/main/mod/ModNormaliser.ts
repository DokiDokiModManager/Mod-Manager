import {ModMapper} from "./ModMapper";
import ModManagerFormat from "./mappers/ModManagerFormat";
import NestedGameFolder from "./mappers/NestedGameFolder";
import ModTemplateFormat from "./mappers/ModTemplateFormat";
import InstallAppropriateFiles from "./mappers/InstallAppropriateFiles";
import DumpAndHopeForTheBest from "./mappers/DumpAndHopeForTheBest";
import unzip from "../archive/Unzipper";
import Logger from "../utils/Logger";

/*
    This script is intended to take any zip file and try and determine how DDMM should install it, if it is a mod.
    There's so many different ways mods are packaged, so this won't cover every scenario, but DDMM will allow the user
    to install a mod manually if this fails.

    Update (2020): so that was a f***ing lie
 */

/*
    Looks at the file structure of the zip file and attempts to determine what the format of the mod is.
 */
export function inferMapper(zipPath: string): Promise<ModMapper> {
    return new Promise((ff, rj) => {
        const zip = unzip(zipPath);
        const structure = [];

        zip.on("file", (file) => {
            structure.push(file.path);
        });

        zip.on("directory", (dir) => {
            structure.push(dir.path);
        });

        zip.on("error", (err) => {
            rj(err);
        });

        zip.on("close", () => {
            if (structure.indexOf("mod.json") !== -1
                || structure.indexOf("game/") !== -1) {
                Logger.debug("Mod Normaliser", "This mod is probably using the DDMMv1 mod format. Surprised? Me too!");
                ff(new ModManagerFormat());
                return;
            }

            // // DDLCtVN special case
            // if (structure.find((file) => file.startsWith("DDLCtVN"))) {
            //     ff(new NestedGameFolder(["scripts.rpa"]));
            //     return;
            // }

            let isNested: boolean = false;
            let isModTemplate: boolean = false;
            let onlyRenpy: boolean = true;

            for (const path of structure) {
                const pathParts = path.split("/");

                if (pathParts[1] === "game") {
                    Logger.debug("Mod Normaliser", "This mod appears to be using the DDLC Mod Template format (or similar)");
                    isModTemplate = true;
                }

                if (["mod_assets", "python-packages", "saves", "audio.rpa", "fonts.rpa", "scripts.rpa"].indexOf(pathParts[1]) !== -1) {
                    Logger.debug("Mod Normaliser", "Detected " + pathParts[1] + " not in the root of the zip");
                    isNested = true;
                }

                if (!path.endsWith("/") &&
                    !path.match(/\.rp(y|yc|a)$/i) &&
                    !path.match(/\.(txt|md|html|pdf|docx)$/i)) {
                    onlyRenpy = false;
                }
            }

            if (isModTemplate) {
                ff(new ModTemplateFormat());
            } else if (isNested) {
                ff(new NestedGameFolder());
            } else if (!onlyRenpy) {
                ff(new DumpAndHopeForTheBest());
            } else {
                ff(new InstallAppropriateFiles());
            }
        });
    });
}
