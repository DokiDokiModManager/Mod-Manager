import * as makeClient from "discord-rich-presence";
import {app} from "electron";
import Config from "../utils/Config";
import Timeout = NodeJS.Timeout;
import I18n from "../i18n/i18n";
import getDebugString from "../utils/DebugString";
import Logger from "../utils/Logger";

const lang: I18n = new I18n();

export default class DiscordManager {

    private client: any;

    private readonly presenceUpdateTimer: Timeout;

    private presence: RichPresenceData = null;

    constructor(appID: string) {
        if (Config.readConfigValue("discordEnabled")) {
            this.client = makeClient(appID);

            this.client.on("error", e => {
                this.client = null;
                Logger.warn("Discord", "Error while initialising RPC");
                console.warn(e);
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
            details: lang.translate("main.discord.status_idle"),
            startTimestamp: Date.now(),
            largeImageKey: "logo",
            smallImageKey: "idle",
            largeImageText: lang.translate("main.discord.description_version", app.getVersion()) + " [" + getDebugString() + "]",
            smallImageText: lang.translate("main.discord.description_idle")
        };

        this.sendPresence();
    }

    /**
     * Sets Discord rich presence to the active (in game) status
     * @param installName The name of the installation
     */
    public setPlayingStatus(installName: string): void {
        this.presence = {
            details: lang.translate("main.discord.status_active"),
            state: installName,
            startTimestamp: Date.now(),
            largeImageKey: "logo",
            smallImageKey: "playing",
            largeImageText: lang.translate("main.discord.description_version", app.getVersion()),
            smallImageText: lang.translate("main.discord.description_active")
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
