"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const http_1 = require("http");
const fs_1 = require("fs");
const path_1 = require("path");
const Config_1 = require("../files/Config");
class SDKServer {
    constructor(port, host) {
        this.server = http_1.createServer(this.requestHandler.bind(this));
        this.server.listen(port, host);
    }
    setPlaying(install) {
        this.install = install;
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
                        "error": "Request body too large."
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
                        "error": "Invalid request."
                    }));
                }
                res.end();
            });
        }
        else {
            res.statusCode = 405;
            res.write(JSON.stringify({
                "error": "Method " + req.method + " not allowed."
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
            console.log(installData.achievements, body.payload);
            if (!installData.achievements) {
                installData.achievements = [
                    achievement
                ];
            }
            else {
                if (installData.achievements.find((achievement) => achievement.id === body.payload.id)) {
                    res.write(JSON.stringify({
                        "ok": true,
                        "message": "Achievement already registered."
                    }));
                    return; // really? i forgot this?
                }
                installData.achievements.push(achievement);
            }
            fs_1.writeFileSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", this.install, "install.json"), JSON.stringify(installData));
            res.write(JSON.stringify({
                "ok": true
            }));
        }
        else if (body.method === "earn achievement") {
            const installData = JSON.parse(fs_1.readFileSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", this.install, "install.json")).toString("utf8"));
            let achievement = installData.achievements.find((achievement) => achievement.id === body.payload.id);
            try {
                if (!achievement.earned) {
                    new electron_1.Notification({
                        title: "Achievement Unlocked!",
                        body: achievement.name + " - " + achievement.description,
                        icon: "../../../build/icon.png"
                    }).show();
                    achievement.earned = true;
                }
            }
            catch (e) {
                res.statusCode = 400;
                res.write(JSON.stringify({
                    "error": "Achievement not registered."
                }));
                return;
            }
            fs_1.writeFileSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", this.install, "install.json"), JSON.stringify(installData));
            res.write(JSON.stringify({
                "ok": true
            }));
        }
        else if (body.method === "ping") {
            if (this.install) {
                res.write(JSON.stringify({
                    "ok": true
                }));
            }
            else {
                res.statusCode = 400;
                res.write(JSON.stringify({
                    "error": "No game running."
                }));
            }
        }
        else {
            res.statusCode = 404;
            res.write(JSON.stringify({
                "error": "Invalid method."
            }));
        }
        res.end();
    }
}
exports.default = SDKServer;
//# sourceMappingURL=SDKServer.js.map