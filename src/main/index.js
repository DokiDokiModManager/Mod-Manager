"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const modlist_1 = require("./modlist");
const i18n_1 = require("./i18n");
// Permanent reference to the main app window
let appWindow;
const lang = new i18n_1.default(electron_1.app.getLocale());
// region IPC functions
// Restart the app
electron_1.ipcMain.on("restart", () => {
    electron_1.app.relaunch();
    electron_1.app.quit();
});
// Retrieves a list of mods
electron_1.ipcMain.on("get modlist", () => {
    appWindow.webContents.send("got modlist", modlist_1.default.getModList());
});
// Handler for renderer process localisation functions
electron_1.ipcMain.on("translate", (ev, query) => {
    let passArgs = query.args;
    passArgs.unshift(query.key);
    ev.returnValue = lang.translate.apply(lang, passArgs);
});
// Open external URLs
electron_1.ipcMain.on("open url", (ev, url) => {
    electron_1.shell.openExternal(url);
});
// endregion
// App initialisation options
electron_1.app.on("ready", () => {
    electron_1.app.setAppUserModelId("space.doki.modmanager");
    appWindow = new electron_1.BrowserWindow({
        title: "Doki Doki Mod Manager",
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            preload: path_1.join(__dirname, "../renderer/js-preload/preload.js") // contains all the IPC scripts
        },
    });
    appWindow.setMenuBarVisibility(false);
    if (process.env.NODE_ENV === "development") {
        require("devtron").install();
    }
    appWindow.loadFile(path_1.join(__dirname, "../renderer/html/index.html"));
});
//# sourceMappingURL=index.js.map