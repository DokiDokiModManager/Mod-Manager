import * as unzip from "@zudo/unzipper";
import {createWriteStream, unlinkSync} from "fs";
import {mkdirsSync} from "fs-extra";
import {join as joinPath, sep as pathSep} from "path";
import {inferMapper} from "../mods/ModNormaliser";
import Logger from "../utilities/Logger";

export default class ModInstaller {

    public static installMod(modPath: string, installPath: string) {
        return new Promise((ff, rj) => {
            inferMapper(modPath).then((mapper) => {
                for (const file of mapper.getFilesToDelete()) {
                    Logger.debug("Deleting " + file);
                    unlinkSync(joinPath(installPath, "game", file));
                }

                const zip = unzip(modPath);

                Logger.info("Installing with mapper: " + mapper.getFriendlyName());

                zip.on("file", (file) => {
                    const newPath = mapper.mapFile(file.path);
                    if (!newPath) {
                        return;
                    }
                    Logger.debug("Mapping " + file.path + " to " + newPath);
                    const newPathFull = joinPath(installPath, newPath);
                    const newPathParts = newPathFull.split(pathSep);
                    const fileName = newPathParts.pop();
                    mkdirsSync(newPathParts.join(pathSep));
                    file.openStream((err, stream) => {
                        if (err) {
                            rj(err);
                        }
                        stream.pipe(createWriteStream(newPathFull));
                    });
                });

                zip.on("close", () => {
                    ff();
                    Logger.info("Install completed.");
                });
            });
        });
    }
}
