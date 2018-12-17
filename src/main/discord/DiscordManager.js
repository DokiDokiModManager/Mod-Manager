"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const makeClient = require("discord-rich-presence");
const electron_1 = require("electron");
const Config_1 = require("../utils/Config");
class DiscordManager {
    constructor(appID) {
        if (Config_1.default.readConfigValue("discordEnabled")) {
            this.client = makeClient(appID);
            this.client.on("error", e => {
                this.client = null;
                console.log("Could not enable Rich Presence: " + e.message);
            });
        }
    }
    /**
     * Sets Discord rich presence to the idle (not playing anything) status
     */
    setIdleStatus() {
        if (!this.client)
            return;
        this.client.updatePresence({
            details: "Managing Mods",
            startTimestamp: Date.now(),
            largeImageKey: "logo",
            smallImageKey: "idle",
            largeImageText: "Version " + electron_1.app.getVersion(),
            smallImageText: "Not playing anything"
        });
    }
    /**
     * Sets Discord rich presence to the active (in game) status
     * @param installName The name of the installation
     */
    setPlayingStatus(installName) {
        if (!this.client)
            return;
        this.client.updatePresence({
            details: "In Game",
            state: installName,
            startTimestamp: Date.now(),
            largeImageKey: "logo",
            smallImageKey: "playing",
            largeImageText: "Version " + electron_1.app.getVersion(),
            smallImageText: "Playing DDLC"
        });
    }
    /**
     * Disconnects from Discord rich presence
     */
    shutdown() {
        if (!this.client)
            return;
        this.client.disconnect();
    }
}
exports.default = DiscordManager;
//# sourceMappingURL=DiscordManager.js.map