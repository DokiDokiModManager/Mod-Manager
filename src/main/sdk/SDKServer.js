"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = require("fs");
const http_1 = require("http");
const path_1 = require("path");
const Config_1 = require("../utils/Config");
const events_1 = require("events");
const LogClass_1 = require("./LogClass");
class SDKServer extends events_1.EventEmitter {
    /**
     * Creates a new SDK server instance
     * @param port The port to listen on
     * @param host The host to listen on
     * @param install The folder name of the install that is being launched
     */
    constructor(port, host, install) {
        super();
        this.server = http_1.createServer(this.requestHandler.bind(this));
        this.server.listen(port, host);
        this.install = install;
    }
    /**
     * Immediately shuts down the SDK server
     */
    shutdown() {
        this.server.close();
        this.server = null;
    }
    requestHandler(req, res) {
        res.setHeader("Content-Type", "application/json");
        if (req.method === "POST") {
            let data = "";
            req.on("data", (chunk) => {
                data += chunk;
                if (data.length > 1e6) {
                    res.statusCode = 413;
                    res.write(JSON.stringify({
                        error: "Request body too large.",
                    }));
                    res.end();
                }
            });
            req.on("end", () => {
                try {
                    const body = JSON.parse(data);
                    this.methodHandler(req, res, body);
                }
                catch (e) {
                    res.statusCode = 400;
                    res.write(JSON.stringify({
                        error: "Invalid request.",
                    }));
                }
                res.end();
            });
        }
        else {
            res.statusCode = 405;
            res.write(JSON.stringify({
                error: "Method " + req.method + " not allowed.",
            }));
            res.end();
        }
    }
    methodHandler(req, res, body) {
        if (body.method === "register achievement") {
            const installData = JSON.parse(fs_1.readFileSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", this.install, "install.json")).toString("utf8"));
            const achievement = {
                description: body.payload.description,
                earned: false,
                id: body.payload.id,
                name: body.payload.name,
            };
            if (!installData.achievements) {
                installData.achievements = [
                    achievement
                ];
            }
            else {
                if (installData.achievements.find((ach) => ach.id === body.payload.id)) {
                    this.emit("log", {
                        text: "Achievement " + achievement.id + " already registered."
                    });
                    res.write(JSON.stringify({
                        message: "Achievement already registered.",
                        ok: true,
                    }));
                    return;
                }
                installData.achievements.push(achievement);
            }
            fs_1.writeFileSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", this.install, "install.json"), JSON.stringify(installData));
            this.emit("log", {
                text: "Registered achievement " + achievement.id + " (" + achievement.name + ")"
            });
            res.write(JSON.stringify({
                ok: true,
            }));
        }
        else if (body.method === "earn achievement") {
            const installData = JSON.parse(fs_1.readFileSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", this.install, "install.json")).toString("utf8"));
            const achievement = installData.achievements.find((ach) => ach.id === body.payload.id);
            try {
                if (!achievement.earned) {
                    this.emit("log", {
                        text: "Achievement " + achievement.id + " earned."
                    });
                    new electron_1.Notification({
                        body: achievement.name + " - " + achievement.description,
                        icon: "../../../build/icon.png",
                        title: "Achievement Unlocked!",
                    }).show();
                    // noinspection JSPrimitiveTypeWrapperUsage
                    achievement.earned = true;
                }
                else {
                    this.emit("log", {
                        text: "Achievement " + achievement.id + " was already earned."
                    });
                }
            }
            catch (e) {
                this.emit("log", {
                    text: "Achievement " + achievement.id + " has not been registered.",
                    clazz: LogClass_1.LogClass.WARNING
                });
                res.statusCode = 400;
                res.write(JSON.stringify({
                    error: "Achievement not registered.",
                }));
                return;
            }
            fs_1.writeFileSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", this.install, "install.json"), JSON.stringify(installData));
            res.write(JSON.stringify({
                ok: true,
            }));
        }
        else if (body.method === "ping") {
            res.write(JSON.stringify({
                ok: true,
            }));
        }
        else {
            res.statusCode = 404;
            this.emit("log", {
                text: "Method not found: " + body.method,
                clazz: LogClass_1.LogClass.ERROR
            });
            res.write(JSON.stringify({
                error: "Invalid method.",
            }));
        }
        res.end();
    }
}
exports.default = SDKServer;
//# sourceMappingURL=SDKServer.js.map