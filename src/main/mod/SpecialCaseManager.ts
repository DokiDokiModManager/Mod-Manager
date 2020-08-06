import fetch from "node-fetch";
import {join as joinPath} from "path";
import {app} from "electron";
import {readFileSync, writeFileSync} from "fs";
import Logger from "../utils/Logger";
import FileHash from "../utils/FileHash";

const SPECIAL_CASES_URL: string = "https://raw.githubusercontent.com/DokiDokiModManager/Meta/master/specialCases.txt";

const SPECIAL_CASES_PATH: string = joinPath(app.getPath("userData"), "specialCases.json");

export default class SpecialCaseManager {

    private ready: boolean = false;
    private specialCasesData: any = {};

    constructor() {
        if (global.ddmm_constants.special_cases_disabled) return;
        fetch(SPECIAL_CASES_URL).then(res => res.text()).then(casesDataRaw => {
            Logger.info("Special Cases", "Using live special case data");
            const lines = casesDataRaw.split("\n").filter(line => line && !line.startsWith("#"));

            lines.forEach(line => {
                const [hash, time, action, parameter] = line.split("\t");
                if (!this.specialCasesData[hash]) {
                    this.specialCasesData[hash] = [];
                }
                this.specialCasesData[hash].push({time, action, parameter});
            });

            console.log(this.specialCasesData);

            writeFileSync(SPECIAL_CASES_PATH, JSON.stringify(this.specialCasesData));
        }).catch(() => {
            try {
                const cachedData: string = readFileSync(SPECIAL_CASES_PATH, "utf-8");
                this.specialCasesData = JSON.parse(cachedData);
                Logger.info("Special Cases", "Using cached special case data");
            } catch (e) {
                Logger.warn("Special Cases", "Using cached special case data was found or unable to load. ");
            }
        }).finally(() => {
            this.ready = true;
        });
    }

    async get(path: string): Promise<any[]> {
        if (global.ddmm_constants.special_cases_disabled) return [];
        const hash = await FileHash.hash(path, "sha1");
        return this.specialCasesData[hash] ? this.specialCasesData[hash] : [];
    }
}
