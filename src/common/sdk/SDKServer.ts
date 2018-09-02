import {Notification} from "electron";
import {readFileSync, writeFileSync} from "fs";
import {createServer, Server} from "http";
import {join as joinPath} from "path";
import Config from "../files/Config";

export default class SDKServer {

    private server: Server;
    private install: string;

    constructor(port: number, host: string) {
        this.server = createServer(this.requestHandler.bind(this));
        this.server.listen(port, host);
    }

    public setPlaying(install: string) {
        this.install = install;
    }

    private requestHandler(req, res) {
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
                } catch (e) {
                    res.statusCode = 400;

                    res.write(JSON.stringify({
                        error: "Invalid request.",
                    }));
                }

                res.end();
            });
        } else {
            res.statusCode = 405;

            res.write(JSON.stringify({
                error: "Method " + req.method + " not allowed.",
            }));
            res.end();
        }
    }

    private methodHandler(req, res, body) {
        if (body.method === "register achievement") {
            const installData = JSON.parse(readFileSync(joinPath(Config.readConfigValue("installFolder"),
                "installs",
                this.install,
                "install.json")).toString("utf8"));

            const achievement = {
                description: body.payload.description,
                earned: false,
                id: body.payload.id,
                name: body.payload.name,
            };

            console.log(installData.achievements, body.payload);

            if (!installData.achievements) {
                installData.achievements = [
                    achievement,
                ];
            } else {
                if (installData.achievements.find((ach) => ach.id === body.payload.id)) {
                    res.write(JSON.stringify({
                        message: "Achievement already registered.",
                        ok: true,
                    }));

                    return; // really? i forgot this?
                }
                installData.achievements.push(achievement);
            }

            writeFileSync(joinPath(Config.readConfigValue("installFolder"),
                "installs",
                this.install,
                "install.json"), JSON.stringify(installData));

            res.write(JSON.stringify({
                ok: true,
            }));
        } else if (body.method === "earn achievement") {
            const installData = JSON.parse(readFileSync(joinPath(Config.readConfigValue("installFolder"),
                "installs",
                this.install,
                "install.json")).toString("utf8"));

            const achievement = installData.achievements.find((ach) => ach.id === body.payload.id);

            try {
                if (!achievement.earned) {
                    new Notification({
                        body: achievement.name + " - " + achievement.description,
                        icon: "../../../build/icon.png",
                        title: "Achievement Unlocked!",
                    }).show();
                    achievement.earned = true;
                }
            } catch (e) {
                res.statusCode = 400;

                res.write(JSON.stringify({
                    error: "Achievement not registered.",
                }));
                return;
            }

            writeFileSync(joinPath(Config.readConfigValue("installFolder"),
                "installs",
                this.install,
                "install.json"), JSON.stringify(installData));

            res.write(JSON.stringify({
                ok: true,
            }));
        } else if (body.method === "ping") {
            if (this.install) {
                res.write(JSON.stringify({
                    ok: true,
                }));
            } else {
                res.statusCode = 400;
                res.write(JSON.stringify({
                    error: "No game running.",
                }));
            }
        } else {
            res.statusCode = 404;

            res.write(JSON.stringify({
                error: "Invalid method.",
            }));
        }

        res.end();
    }
}
