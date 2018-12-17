import * as makeClient from "discord-rich-presence";
import {app} from "electron";
import Config from "../utils/Config";

export default class DiscordManager {
    private client: any;

    constructor(appID: string) {
        if (Config.readConfigValue("discordEnabled")) {
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
    public setIdleStatus(): void {
        if (!this.client) return;
        this.client.updatePresence({
            details: "Managing Mods",
            startTimestamp: Date.now(),
            largeImageKey: "logo",
            smallImageKey: "idle",
            largeImageText: "Version " + app.getVersion(),
            smallImageText: "Not playing anything"
        });
    }

    /**
     * Sets Discord rich presence to the active (in game) status
     * @param installName The name of the installation
     */
    public setPlayingStatus(installName: string): void {
        if (!this.client) return;
        this.client.updatePresence({
            details: "In Game",
            state: installName,
            startTimestamp: Date.now(),
            largeImageKey: "logo",
            smallImageKey: "playing",
            largeImageText: "Version " + app.getVersion(),
            smallImageText: "Playing DDLC"
        });
    }

    /**
     * Disconnects from Discord rich presence
     */
    public shutdown(): void {
        if (!this.client) return;

        this.client.disconnect();
    }
}