import {Notification} from "electron";
import {readFileSync, writeFileSync} from "fs";
import {createServer, Server} from "http";
import {join as joinPath} from "path";
import Config from "../utils/Config";
import {EventEmitter} from "events";
import {LogClass} from "./LogClass";

export default class SDKServer extends EventEmitter {

    private server: Server;
    private readonly install: string;

    /**
     * Creates a new SDK server instance
     * @param port The port to listen on
     * @param host The host to listen on
     * @param install The folder name of the install that is being launched
     */
    constructor(port: number, host: string, install: string) {
        super();

        this.server = createServer(this.requestHandler.bind(this));
        this.server.listen(port, host);
        this.install = install;
    }

    /**
     * Immediately shuts down the SDK server
     */
    public shutdown(): void {
        if (this.server) {
            this.server.close();
        }
        this.server = null;
    }

    private requestHandler(req, res): void {
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

    private methodHandler(req, res, body): void {
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

            if (!installData.achievements) {
                installData.achievements = [
                    achievement
                ];
            } else {
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

            writeFileSync(joinPath(Config.readConfigValue("installFolder"),
                "installs",
                this.install,
                "install.json"), JSON.stringify(installData));

            this.emit("log", {
                text: "Registered achievement " + achievement.id + " (" + achievement.name + ")"
            });

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
                    this.emit("log", {
                        text: "Achievement " + achievement.id + " earned."
                    });

                    new Notification({
                        body: achievement.name + " - " + achievement.description,
                        icon: "../../../build/icon.png",
                        title: "Achievement Unlocked!",
                    }).show();

                    // noinspection JSPrimitiveTypeWrapperUsage
                    achievement.earned = true;
                } else {
                    this.emit("log", {
                        text: "Achievement " + achievement.id + " was already earned."
                    });
                }
            } catch (e) {
                this.emit("log", {
                    text: "Achievement " + achievement.id + " has not been registered.",
                    clazz: LogClass.WARNING
                });

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
            res.write(JSON.stringify({
                ok: true,
            }));
        } else {
            res.statusCode = 404;

            this.emit("log", {
                text: "Method not found: " + body.method,
                clazz: LogClass.ERROR
            });

            res.write(JSON.stringify({
                error: "Invalid method.",
            }));
        }

        res.end();
    }
}