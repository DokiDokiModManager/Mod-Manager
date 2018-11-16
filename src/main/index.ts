import {app, BrowserWindow, ipcMain, IpcMessageEvent} from "electron";
import {join as joinPath} from "path";
import ModList from "./modlist";
import I18n from "./i18n";

// permanent reference to the main app window
let appWindow: BrowserWindow;

const lang: I18n = new I18n(app.getLocale());

ipcMain.on("restart", () => {
    app.relaunch();
    app.quit();
});

ipcMain.on("get modlist", () => {
    appWindow.webContents.send("got modlist", ModList.getModList());
});

ipcMain.on("translate", (ev: IpcMessageEvent, query: { key: string, args: string[] }) => {
    let passArgs: string[] = query.args;
    passArgs.unshift(query.key);
    ev.returnValue = lang.translate.apply(lang, passArgs);
});

// App initialisation options
app.on("ready", () => {

    appWindow = new BrowserWindow({
        title: "Doki Doki Mod Manager",
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            preload: joinPath(__dirname, "../renderer/js-preload/preload.js") // contains all the IPC scripts
        },
    });

    appWindow.setMenuBarVisibility(false);

    if (process.env.NODE_ENV === "development") {
        require("devtron").install();
    }

    appWindow.loadFile(joinPath(__dirname, "../renderer/html/index.html"));
});