"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const modlist_1 = require("./modlist");
const i18n_1 = require("./i18n");
// permanent reference to the main app window
let appWindow;
const lang = new i18n_1.default(electron_1.app.getLocale());
electron_1.ipcMain.on("restart", () => {
    electron_1.app.relaunch();
    electron_1.app.quit();
});
electron_1.ipcMain.on("get modlist", () => {
    appWindow.webContents.send("got modlist", modlist_1.default.getModList());
});
electron_1.ipcMain.on("translate", (ev, query) => {
    let passArgs = query.args;
    passArgs.unshift(query.key);
    ev.returnValue = lang.translate.apply(lang, passArgs);
});
// App initialisation options
electron_1.app.on("ready", () => {
    appWindow = new electron_1.BrowserWindow({
        title: "Doki Doki Mod Manager",
        width: 800,
        height: 600,
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