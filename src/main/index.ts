import {app, BrowserWindow, ipcMain, IpcMessageEvent, shell, dialog, Notification, crashReporter} from "electron";
import {join as joinPath} from "path";
import ModList from "./ModList";
import I18n from "./i18n";
import InstallList from "./install/InstallList";
import InstallLauncher from "./install/InstallLauncher";
import Config from "./config";
import InstallCreator from "./install/InstallCreator";
import ModInstaller from "./mod/ModInstaller";
import InstallManager from "./install/InstallManager";

// region Crash reporting
crashReporter.start({
    companyName: "DDMM",
    productName: "DokiDokiModManager",
    ignoreSystemCrashHandler: true,
    extra: {
        "purist_mode": Config.readConfigValue("puristMode"),
        "install_directory": Config.readConfigValue("installFolder")
    },
    uploadToServer: true,
    submitURL: "https://sentry.io/api/1297252/minidump/?sentry_key=bf0edf3f287344d4969e3171c33af4ea"
});
// endregion

// region Flags and references

// User agent for API requests
const USER_AGENT = "DokiDokiModManager/" + app.getVersion() + " (zudo@doki.space)";

// Permanent reference to the main app window
let appWindow: BrowserWindow;

// Flag for allowing the app window to be closed
let windowClosable: boolean = true;

const lang: I18n = new I18n(app.getLocale());

// endregion

// region IPC functions

function showError(title: string, body: string, stacktrace: string, fatal: boolean) {
    appWindow.webContents.send("error message", {
        title, body, fatal, stacktrace
    });

    windowClosable = true;
    appWindow.setClosable(true);
}

// Restart the app
ipcMain.on("restart", () => {
    app.relaunch();
    app.quit();
});

// Retrieves a list of mods
ipcMain.on("get modlist", () => {
    appWindow.webContents.send("got modlist", ModList.getModList());
});

// Retrieves a list of installs
ipcMain.on("get installs", () => {
    appWindow.webContents.send("got installs", InstallList.getInstallList());
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

// Toggle closeable flag
ipcMain.on("closable", (ev: IpcMessageEvent, flag: boolean) => {
    windowClosable = flag;
    appWindow.setClosable(flag);
});

// Config IPC functions
ipcMain.on("save config", (ev: IpcMessageEvent, configData: { key: string, value: any }) => {
    Config.saveConfigValue(configData.key, configData.value);
});

ipcMain.on("read config", (ev: IpcMessageEvent, key: string) => {
    ev.returnValue = Config.readConfigValue(key);
});

// Launch install
ipcMain.on("launch install", (ev: IpcMessageEvent, folderName: string) => {
    Config.saveConfigValue("lastLaunchedInstall", folderName);
    appWindow.minimize(); // minimise the window to draw attention to the fact another window will be appearing
    appWindow.webContents.send("running cover", {
        display: true,
        dismissable: false,
        title: lang.translate("running_cover.running.title"),
        description: lang.translate("running_cover.running.description")
    });
    InstallLauncher.launchInstall(folderName).then(() => {
        appWindow.restore(); // show DDMM again
        appWindow.focus();
        appWindow.webContents.send("running cover", {display: false});
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
ipcMain.on("browse mods", (ev: IpcMessageEvent) => {
    dialog.showOpenDialog(appWindow, {
        buttonLabel: lang.translate("mods.browse_dialog.button_label"),
        title: lang.translate("mods.browse_dialog.title"),
        filters: [{
            extensions: ["zip", "gz", "tar", "rar", "7z"],
            name: lang.translate("mods.browse_dialog.file_format_name")
        }],
    }, (filePaths: string[]) => {
        ev.returnValue = filePaths;
    });
});

// Trigger install creation
ipcMain.on("create install", (ev: IpcMessageEvent, install: { folderName: string, installName: string, globalSave: boolean, mod: string }) => {
    windowClosable = false;
    appWindow.setClosable(false);
    InstallCreator.createInstall(install.folderName, install.installName, install.globalSave).then(() => {
        if (!install.mod) {
            appWindow.webContents.send("got installs", InstallList.getInstallList());
            windowClosable = true;
            appWindow.setClosable(true);
        } else {
            ModInstaller.installMod(install.mod, joinPath(Config.readConfigValue("installFolder"), "installs", install.folderName, "install")).then(() => {
                appWindow.webContents.send("got installs", InstallList.getInstallList());
                windowClosable = true;
                appWindow.setClosable(true);
            }).catch((e: Error) => {
                showError(
                    lang.translate("exceptions.mod_install_notification.title"),
                    lang.translate("exceptions.mod_install_notification.body"),
                    e.toString(),
                    false
                );
            });
        }
    }).catch((e: Error) => {
        showError(
            lang.translate("exceptions.game_install_notification.title"),
            lang.translate("exceptions.game_install_notification.body"),
            e.toString(),
            false
        );
    });
});

// Delete an install permanently
ipcMain.on("delete install", (ev: IpcMessageEvent, folderName: string) => {
    InstallManager.deleteInstall(folderName).then(() => {
        appWindow.webContents.send("got installs", InstallList.getInstallList());
    }).catch((e: Error) => {
        showError(
            lang.translate("exceptions.install_delete_notification.title"),
            lang.translate("exceptions.install_delete_notification.body"),
            e.toString(),
            false
        );
    });
});

// Delete a save file for an install
ipcMain.on("delete save", (ev: IpcMessageEvent, folderName: string) => {
    InstallManager.deleteSaveData(folderName).then(() => {
        appWindow.webContents.send("got installs", InstallList.getInstallList());
    }).catch((e: Error) => {
        showError(
            lang.translate("exceptions.save_delete_notification.title"),
            lang.translate("exceptions.save_delete_notification.body"),
            e.toString(),
            false
        );
    });
});

// Crash for debugging
ipcMain.on("debug crash", () => {
    throw new Error("User forced debug crash with DevTools")
});

// endregion

// region Global exception handler
process.on("uncaughtException", (e: Error) => {
    console.log("Uncaught exception occurred - treating this as a crash.");
    console.error(e);
    showError(
        lang.translate("exceptions.main_crash_notification.title"),
        lang.translate("exceptions.main_crash_notification.body"),
        e.toString(),
        true
    );
});
// endregion

// region App initialisation
app.on("second-instance", () => {
    appWindow.restore();
    appWindow.focus();
});

app.on("ready", () => {

    app.setAppUserModelId("space.doki.modmanager");

    if (!app.requestSingleInstanceLock()) {
        // we should quit, as another instance is running
        console.log("App already running.");
        app.quit();
        return; // avoid running for longer than needed
    }

    // create browser window
    appWindow = new BrowserWindow({
        title: "Doki Doki Mod Manager",
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 600,
        maximizable: true,
        webPreferences: {
            sandbox: true,
            nodeIntegration: false,
            preload: joinPath(__dirname, "../renderer/js-preload/preload.js") // contains all the IPC scripts
        },
        show: false
    });

    // set user agent so web services can contact me if necessary
    appWindow.webContents.setUserAgent(USER_AGENT);

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
        const crashNotif = new Notification({
            title: lang.translate("exceptions.renderer_crash_notification.title"),
            body: lang.translate("exceptions.renderer_crash_notification.body"),
        });

        crashNotif.show();
        app.quit();
    });

    appWindow.on("unresponsive", () => {
        const freezeNotif = new Notification({
            title: lang.translate("exceptions.renderer_freeze_notification.title"),
            body: lang.translate("exceptions.renderer_freeze_notification.body"),
        });

        freezeNotif.show();
    });

    appWindow.on("closed", () => {
        appWindow = null;
        app.quit();
    });

    appWindow.setMenu(null);

    if (process.env.DDMM_DEVTOOLS) {
        appWindow.webContents.openDevTools({mode: "detach"});
    }

    appWindow.loadFile(joinPath(__dirname, "../renderer/html/index.html"));
});
// endregion