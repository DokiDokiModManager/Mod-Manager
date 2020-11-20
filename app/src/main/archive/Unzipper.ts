import * as yauzl from "yauzl";
import EventEmitter from "events";
import Logger from "../utils/Logger";

export default function unzip(file) {
    const emitter = new EventEmitter();
    Logger.info("Unzipper", "Extracting " + file);
    try {
        yauzl.open(file, {lazyEntries: true, autoClose: true}, (err, zip) => {
            let directoriesRead = [];

            if (err) {
                emitter.emit("error", err);
                return emitter;
            }

            zip.readEntry();
            zip.on("entry", entry => {
                if (entry.fileName.endsWith("/")) {
                    // it's an explicit directory
                    if (directoriesRead.indexOf(entry.fileName) === -1) {
                        emitter.emit("directory", {
                            path: entry.fileName
                        });
                        directoriesRead.push(entry.fileName);
                    }
                } else {
                    // it's a file
                    emitter.emit("file", {
                        path: entry.fileName,
                        openStream: function (callback) {
                            zip.openReadStream(entry, (err, stream) => {
                                callback(err, stream);
                            });
                        }
                    });

                    // test for implicit directories
                    let pathParts = entry.fileName.split("/");
                    if (pathParts.length > 1) {
                        let dirParts = pathParts.slice(0, pathParts.length);
                        for (let i = 1; i < dirParts.length; i++) {
                            let dir = dirParts.slice(0, i).join("/") + "/";
                            if (directoriesRead.indexOf(dir) === -1) {
                                directoriesRead.push(dir);
                                emitter.emit("directory", {
                                    path: dir
                                });
                            }
                        }
                    }
                }
                zip.readEntry();
            });

            zip.on("error", err => {
                emitter.emit(err);
            });

            zip.on("close", () => {
                emitter.emit("close");
            });
        });
    } catch (e) {
        emitter.emit("error", e);
        emitter.emit("close");
        return emitter;
    }
    return emitter;
}
