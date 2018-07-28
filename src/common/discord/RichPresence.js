"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createRichPresence = require("discord-rich-presence");
const Logger_1 = require("../utilities/Logger");
class RichPresence {
    constructor(appID) {
        this.appID = appID;
        this.connect();
        this.connected = true;
    }
    connect() {
        this.rp = createRichPresence(this.appID);
        this.rp.on("error", (error) => {
            Logger_1.default.warn("Error while activating Discord Rich Presence: " + error.message);
        });
    }
    disconnect() {
        this.rp.disconnect();
        this.connected = false;
    }
    setIdlePresence() {
        if (!this.connected) {
            return;
        }
        this.rp.updatePresence({
            // details: "Version 2.0",
            largeImageKey: "logo",
            state: "Managing Mods",
        });
    }
    setPlayingPresence(installName) {
        if (!this.connected) {
            return;
        }
        this.rp.updatePresence({
            details: installName,
            largeImageKey: "logo",
            startTimestamp: Date.now() / 1000,
            state: "In Game",
        });
    }
}
exports.default = RichPresence;
//# sourceMappingURL=RichPresence.js.map