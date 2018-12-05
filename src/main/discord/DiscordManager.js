"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const makeClient = require("discord-rich-presence");
const electron_1 = require("electron");
const Config_1 = require("../utils/Config");
class DiscordManager {
    constructor(appID) {
        if (!Config_1.default.readConfigValue("puristMode")) {
            this.client = makeClient(appID);
        }
    }
    setIdleStatus() {
        if (!this.client)
            return;
        this.client.updatePresence({
            details: "Managing Mods",
            largeImageKey: "logo",
            smallImageKey: "idle",
            largeImageText: "Version " + electron_1.app.getVersion(),
            smallImageText: "Not playing anything"
        });
    }
    setPlayingStatus(folderName) {
        if (!this.client)
            return;
        this.client.updatePresence({
            details: "In Game",
            state: folderName,
            startTimestamp: Date.now(),
            largeImageKey: "logo",
            smallImageKey: "playing",
            largeImageText: "Version " + electron_1.app.getVersion(),
            smallImageText: "Playing DDLC"
        });
    }
}
exports.default = DiscordManager;
//# sourceMappingURL=DiscordManager.js.map