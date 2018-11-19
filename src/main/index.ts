import {app, BrowserWindow, ipcMain, IpcMessageEvent, shell} from "electron";
import {join as joinPath} from "path";
import ModList from "./modlist";
import I18n from "./i18n";

// Permanent reference to the main app window
let appWindow: BrowserWindow;

const lang: I18n = new I18n(app.getLocale());

// region IPC functions

// Restart the app
ipcMain.on("restart", () => {
    app.relaunch();
    app.quit();
});

// Retrieves a list of mods
ipcMain.on("get modlist", () => {
    appWindow.webContents.send("got modlist", ModList.getModList());
});

// Handler for renderer process localisation functions
ipcMain.on("translate", (ev: IpcMessageEvent, query: { key: string, args: string[] }) => {
    let passArgs: string[] = query.args;
    passArgs.unshift(query.key);
    ev.returnValue = lang.translate.apply(lang, passArgs);
});

// Open external URLs
ipcMain.on("open url", (ev: IpcMessageEvent, url: string) => {
    shell.openExternal(url);
});

// endregion

// App initialisation options
app.on("ready", () => {

    app.setAppUserModelId("space.doki.modmanager");

    appWindow = new BrowserWindow({
        title: "Doki Doki Mod Manager",
        width: 1000,
        height: 800,
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