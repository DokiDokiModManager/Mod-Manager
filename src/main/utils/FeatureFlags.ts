import fetch from "node-fetch";
import {join as joinPath} from "path";
import {app} from "electron";
import {readFileSync, writeFileSync} from "fs";
import Logger from "./Logger";

const FEATURE_FLAGS_URL: string = "https://raw.githubusercontent.com/DokiDokiModManager/Meta/master/featureFlags.json";

const FEATURE_FLAGS_PATH: string = joinPath(app.getPath("userData"), "featureFlags.json");

export default class FeatureFlags {

    private ready: boolean = false;
    private flagsData: any;

    constructor() {
        fetch(FEATURE_FLAGS_URL).then(res => res.json()).then(flagsData => {
            this.flagsData = flagsData;
            this.ready = true;

            Logger.info("Feature Flags", "Using live feature flag data");

            writeFileSync(FEATURE_FLAGS_PATH, JSON.stringify(flagsData));
        }).catch(() => {
            try {
                const cachedData: string = readFileSync(FEATURE_FLAGS_PATH, "utf-8");
                this.flagsData = JSON.parse(cachedData);
                Logger.info("Feature Flags", "Using cached feature flag data");
            } catch (e) {
                Logger.warn("Feature Flags", "No cached feature flag data was found or unable to load. Defaulting all to FALSE!");
            }
        });
    }

    get(flag: string): boolean {
        if (process.env.DDMM_DEVELOPER) return true;
        if (!this.ready) return false;
        try {
            return !!this.flagsData[flag][process.platform];
        } catch (e) {
            Logger.warn("Feature Flags", "Could not retrieve feature flag " + flag);
            return false;
        }
    }
}
