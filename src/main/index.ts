import {app, BrowserWindow, ipcMain} from "electron";
import {join as joinPath} from "path";
import ModList from "./modlist";
import I18n from "./i18n";

// permanent reference to the main app window
let appWindow: BrowserWindow;

ipcMain.on("restart", () => {
    app.relaunch();
    app.quit();
});

ipcMain.on("get modlist", () => {
    appWindow.webContents.send("got modlist", ModList.getModList());
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

    appWindow.loadFile(joinPath(__dirname, "../renderer/html/index.html"));
});