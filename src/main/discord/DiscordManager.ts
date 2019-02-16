import * as makeClient from "discord-rich-presence";
import {app} from "electron";
import Config from "../utils/Config";
import Timeout = NodeJS.Timeout;

export default class DiscordManager {

    private client: any;

    private presenceUpdateTimer: Timeout;

    private presence: RichPresenceData = null;

    constructor(appID: string) {
        if (Config.readConfigValue("discordEnabled")) {
            this.client = makeClient(appID);

            this.client.on("error", e => {
                this.client = null;
                console.log("Could not enable Rich Presence: " + e.message);
            });

            this.presenceUpdateTimer = setInterval(() => {
                this.sendPresence();
            }, 5000);
        }
    }

    /**
     * Sends the presence data to Discord
     */
    private sendPresence(): void {
        if (!this.client) return;
        this.client.updatePresence(this.presence);
    }

    /**
     * Sets Discord rich presence to the idle (not playing anything) status
     */
    public setIdleStatus(): void {
        this.presence = {
            details: "Managing Mods",
            startTimestamp: Date.now(),
            largeImageKey: "logo",
            smallImageKey: "idle",
            largeImageText: "Version " + app.getVersion(),
            smallImageText: "Not playing anything"
        };

        this.sendPresence();
    }

    /**
     * Sets Discord rich presence to the active (in game) status
     * @param installName The name of the installation
     */
    public setPlayingStatus(installName: string): void {
        this.presence = {
            details: "In Game",
            state: installName,
            startTimestamp: Date.now(),
            largeImageKey: "logo",
            smallImageKey: "playing",
            largeImageText: "Version " + app.getVersion(),
            smallImageText: "Playing DDLC"
        };

        this.sendPresence();
    }

    /**
     * Disconnects from Discord rich presence
     */
    public shutdown(): void {
        if (!this.client) return;
        clearTimeout(this.presenceUpdateTimer);
        this.client.disconnect();
    }
}

class RichPresenceData {
    details?: string;
    state?: string;
    startTimestamp?: number;
    endTimestamp?: number;
    largeImageKey?: string;
    smallImageKey?: string;
    largeImageText?: string;
    smallImageText?: string;
}