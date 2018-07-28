import * as createRichPresence from "discord-rich-presence";
import Logger from "../utilities/Logger";

export default class RichPresence {

    private readonly appID: string;
    private rp;
    private connected: boolean;

    constructor(appID: string) {
        this.appID = appID;
        this.connect();
        this.connected = true;
    }

    public connect() {
        this.rp = createRichPresence(this.appID);
        this.rp.on("error", (error) => {
            Logger.warn("Error while activating Discord Rich Presence: " + error.message);
        });
    }

    public disconnect() {
        this.rp.disconnect();
        this.connected = false;
    }

    public setIdlePresence() {
        if (!this.connected) {
            return;
        }

        this.rp.updatePresence({
            // details: "Version 2.0",
            largeImageKey: "logo",
            state: "Managing Mods",
        });
    }

    public setPlayingPresence(installName: string) {
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
