"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const modlist_1 = require("./modlist");
// permanent reference to the main app window
let appWindow;
electron_1.ipcMain.on("restart", () => {
    electron_1.app.relaunch();
    electron_1.app.quit();
});
electron_1.ipcMain.on("get modlist", () => {
    appWindow.webContents.send("got modlist", modlist_1.default.getModList());
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
    appWindow.loadFile(path_1.join(__dirname, "../renderer/html/index.html"));
});
//# sourceMappingURL=index.js.map