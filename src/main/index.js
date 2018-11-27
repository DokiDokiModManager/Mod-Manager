"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const ModList_1 = require("./ModList");
const i18n_1 = require("./i18n");
const InstallList_1 = require("./InstallList");
const InstallLauncher_1 = require("./InstallLauncher");
const config_1 = require("./config");
const InstallCreator_1 = require("./InstallCreator");
const ModInstaller_1 = require("./mod/ModInstaller");
// region Crash reporting
electron_1.crashReporter.start({
    companyName: "DDMM",
    productName: "DokiDokiModManager",
    ignoreSystemCrashHandler: true,
    extra: {
        "purist_mode": config_1.default.readConfigValue("puristMode"),
        "install_directory": config_1.default.readConfigValue("installFolder")
    },
    uploadToServer: true,
    submitURL: "https://sentry.io/api/1297252/minidump/?sentry_key=bf0edf3f287344d4969e3171c33af4ea"
});
// endregion
// region Flags and references
// Permanent reference to the main app window
let appWindow;
// Flag for allowing the app window to be closed
let windowClosable = true;
const lang = new i18n_1.default(electron_1.app.getLocale());
// endregion
// region IPC functions
function showError(title, body, stacktrace, fatal) {
    appWindow.webContents.send("error message", {
        title, body, fatal, stacktrace
    });
    windowClosable = true;
    appWindow.setClosable(true);
}
// Restart the app
electron_1.ipcMain.on("restart", () => {
    electron_1.app.relaunch();
    electron_1.app.quit();
});
// Retrieves a list of mods
electron_1.ipcMain.on("get modlist", () => {
    appWindow.webContents.send("got modlist", ModList_1.default.getModList());
});
// Retrieves a list of installs
electron_1.ipcMain.on("get installs", () => {
    appWindow.webContents.send("got installs", InstallList_1.default.getInstallList());
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
// Config IPC functions
electron_1.ipcMain.on("save config", (ev, configData) => {
    config_1.default.saveConfigValue(configData.key, configData.value);
});
electron_1.ipcMain.on("read config", (ev, key) => {
    ev.returnValue = config_1.default.readConfigValue(key);
});
// Launch install
electron_1.ipcMain.on("launch install", (ev, folderName) => {
    config_1.default.saveConfigValue("lastLaunchedInstall", folderName);
    appWindow.minimize(); // minimise the window to draw attention to the fact another window will be appearing
    appWindow.webContents.send("running cover", {
        display: true,
        dismissable: false,
        title: lang.translate("running_cover.running.title"),
        description: lang.translate("running_cover.running.description")
    });
    InstallLauncher_1.default.launchInstall(folderName).then(() => {
        appWindow.restore(); // show DDMM again
        appWindow.focus();
        appWindow.webContents.send("running cover", { display: false });
    }).catch(err => {
        appWindow.restore();
        appWindow.focus();
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
        filters: [{ extensions: ["zip"], name: lang.translate("mods.browse_dialog.file_format_name") }],
    }, (filePaths) => {
        ev.returnValue = filePaths;
    });
});
// Trigger install creation
electron_1.ipcMain.on("create install", (ev, install) => {
    windowClosable = false;
    appWindow.setClosable(false);
    InstallCreator_1.default.createInstall(install.folderName, install.installName, install.globalSave).then(() => {
        if (!install.mod) {
            appWindow.webContents.send("got installs", InstallList_1.default.getInstallList());
            windowClosable = true;
            appWindow.setClosable(true);
        }
        else {
            ModInstaller_1.default.installMod(install.mod, path_1.join(config_1.default.readConfigValue("installFolder"), "installs", install.folderName, "install")).then(() => {
                appWindow.webContents.send("got installs", InstallList_1.default.getInstallList());
                windowClosable = true;
                appWindow.setClosable(true);
            }).catch((e) => {
                showError(lang.translate("exceptions.mod_install_notification.title"), lang.translate("exceptions.mod_install_notification.body"), e.toString(), false);
            });
        }
    }).catch((e) => {
        showError(lang.translate("exceptions.game_install_notification.title"), lang.translate("exceptions.game_install_notification.body"), e.toString(), false);
    });
});
// crash for debugging
electron_1.ipcMain.on("debug crash", () => {
    throw new Error("User forced debug crash with DevTools");
});
// endregion
process.on("uncaughtException", (e) => {
    showError(lang.translate("exceptions.main_crash_notification.title"), lang.translate("exceptions.main_crash_notification.body"), e.toString(), true);
});
// region App initialisation
electron_1.app.on("second-instance", () => {
    appWindow.restore();
    appWindow.focus();
});
electron_1.app.on("ready", () => {
    electron_1.app.setAppUserModelId("space.doki.modmanager");
    if (!electron_1.app.requestSingleInstanceLock()) {
        // we should quit, as another instance is running
        console.log("App already running.");
        electron_1.app.quit();
        return; // avoid running for longer than needed
    }
    appWindow = new electron_1.BrowserWindow({
        title: "Doki Doki Mod Manager",
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 600,
        maximizable: true,
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