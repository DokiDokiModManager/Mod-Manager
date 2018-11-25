"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const mod_list_1 = require("./mod_list");
const i18n_1 = require("./i18n");
const install_list_1 = require("./install_list");
const install_launcher_1 = require("./install_launcher");
// region Flags and references
// Permanent reference to the main app window
let appWindow;
// Flag for allowing the app window to be closed
let windowClosable = true;
const lang = new i18n_1.default(electron_1.app.getLocale());
// endregion
// region IPC functions
// Restart the app
electron_1.ipcMain.on("restart", () => {
    electron_1.app.relaunch();
    electron_1.app.quit();
});
// Retrieves a list of mods
electron_1.ipcMain.on("get modlist", () => {
    appWindow.webContents.send("got modlist", mod_list_1.default.getModList());
});
// Retrieves a list of installs
electron_1.ipcMain.on("get installs", () => {
    appWindow.webContents.send("got installs", install_list_1.default.getInstallList());
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
// Toggle closeable flag
electron_1.ipcMain.on("closable", (ev, flag) => {
    windowClosable = flag;
    appWindow.setClosable(flag);
});
// Launch install
electron_1.ipcMain.on("launch install", (ev, folderName) => {
    appWindow.minimize(); // minimise the window to draw attention to the fact another window will be appearing
    appWindow.webContents.send("running cover", {
        display: true,
        dismissable: false,
        title: lang.translate("running_cover.running.title"),
        description: lang.translate("running_cover.running.description")
    });
    install_launcher_1.default.launchInstall(folderName).then(() => {
        appWindow.restore(); // show DDMM again
        appWindow.webContents.send("running cover", { display: false });
    }).catch(err => {
        appWindow.restore();
        appWindow.webContents.send("running cover", {
            display: true,
            dismissable: true,
            title: lang.translate("running_cover.error.title"),
            description: err
        });
    });
});
// Browse for a mod
electron_1.ipcMain.on("browse mods", (ev) => {
    electron_1.dialog.showOpenDialog(appWindow, {
        buttonLabel: lang.translate("mods.browse_dialog.button_label"),
        title: lang.translate("mods.browse_dialog.title"),
        filters: [{ extensions: ["zip"], name: lang.translate("mods.browse_dialog.file_format_name") }]
    });
});
// endregion
// region App initialisation
process.on("uncaughtException", () => {
    const crashNotif = new electron_1.Notification({
        title: lang.translate("exceptions.main_crash_notification.title"),
        body: lang.translate("exceptions.main_crash_notification.body"),
    });
    crashNotif.show();
    electron_1.app.quit();
});
electron_1.app.on("ready", () => {
    electron_1.app.setAppUserModelId("space.doki.modmanager");
    appWindow = new electron_1.BrowserWindow({
        title: "Doki Doki Mod Manager",
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 800,
        webPreferences: {
            sandbox: true,
            nodeIntegration: false,
            preload: path_1.join(__dirname, "../renderer/js-preload/preload.js") // contains all the IPC scripts
        },
        show: false
    });
    appWindow.webContents.on("will-navigate", ev => {
        console.warn("Prevented navigation from app container");
        ev.preventDefault(); // prevent navigation
    });
    appWindow.webContents.on("did-finish-load", () => {
        if (!appWindow.isVisible()) {
            appWindow.show();
        }
    });
    appWindow.on("close", (ev) => {
        if (!windowClosable) {
            ev.preventDefault();
        }
    });
    appWindow.webContents.on("crashed", () => {
        const crashNotif = new electron_1.Notification({
            title: lang.translate("exceptions.renderer_crash_notification.title"),
            body: lang.translate("exceptions.renderer_crash_notification.body"),
        });
        crashNotif.show();
        electron_1.app.quit();
    });
    appWindow.on("unresponsive", () => {
        const freezeNotif = new electron_1.Notification({
            title: lang.translate("exceptions.renderer_freeze_notification.title"),
            body: lang.translate("exceptions.renderer_freeze_notification.body"),
        });
        freezeNotif.show();
    });
    appWindow.on("closed", () => {
        appWindow = null;
        electron_1.app.quit();
    });
    appWindow.setMenuBarVisibility(false);
    appWindow.loadFile(path_1.join(__dirname, "../renderer/html/index.html"));
});
// endregion
//# sourceMappingURL=index.js.map