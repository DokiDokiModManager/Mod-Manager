import {app} from "electron";
import fetch from "node-fetch";
import {writeFileSync} from "fs";
import {join as joinPath} from "path";
import Logger from "../utils/Logger";

const BASE_URL = "https://raw.githubusercontent.com/DokiDokiModManager/Mod-Manager/master/lang/"

export async function downloadLanguageFile(code: string) {
    if (global.ddmm_constants.i18n_update_disabled) return;
    Logger.info("Web i18n", "Downloading language data for " + code);
    const url: string = `${BASE_URL}${code}.json`;
    const path: string = joinPath(app.getPath("userData"), "language", code + ".json");
    const response = await fetch(url);
    if (response.status !== 200) throw new Error(response.status);
    const data: any = await response.json();
    writeFileSync(path, JSON.stringify(data));
    return data;
}
