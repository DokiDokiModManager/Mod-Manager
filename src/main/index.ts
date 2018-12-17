import {app, BrowserWindow, ipcMain, IpcMessageEvent, shell, dialog, Notification, crashReporter} from "electron";
import {move, existsSync, mkdirpSync, readdirSync} from "fs-extra";
import {join as joinPath} from "path";

// One of my major regrets in life is putting an ! at the end of the application name
// This should allow me to use a sane directory name but not break old installs.
if (existsSync(joinPath(app.getPath("appData"), "Doki Doki Mod Manager!"))) {
    console.log("Overriding app data path");
    app.setPath("userData", joinPath(app.getPath("appData"), "Doki Doki Mod Manager!"));
} else {
    app.setPath("userData", joinPath(app.getPath("appData"), "DokiDokiModManager"));
}

app.setName("Doki Doki Mod Manager!");

import ModList from "./mod/ModList";
import I18n from "./utils/i18n";
import InstallList from "./install/InstallList";
import InstallLauncher from "./install/InstallLauncher";
import Config from "./utils/Config";
import InstallCreator from "./install/InstallCreator";
import ModInstaller from "./mod/ModInstaller";
import InstallManager from "./install/InstallManager";
import DiscordManager from "./discord/DiscordManager";
import DownloadManager from "./net/DownloadManager";

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

// The last argument, might be a ddmm:// url
const lastArg: string = process.argv.pop();

// Permanent reference to the main app window
let appWindow: BrowserWindow;

// Discord rich presence
let richPresence: DiscordManager = new DiscordManager(process.env.DDMM_DISCORD_ID ? process.env.DDMM_DISCORD_ID : "453299645725016074");

richPresence.setIdleStatus();

// Download manager
let downloadManager: DownloadManager;

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

function launchInstall(folderName) {
    Config.saveConfigValue("lastLaunchedInstall", folderName);
    appWindow.minimize(); // minimise the window to draw attention to the fact another window will be appearing
    appWindow.webContents.send("running cover", {
        display: true,
        dismissable: false,
        title: lang.translate("running_cover.running.title"),
        description: lang.translate("running_cover.running.description")
    });
    richPresence.setPlayingStatus(folderName);
    InstallLauncher.launchInstall(folderName).then(() => {
        richPresence.setIdleStatus();
        appWindow.restore(); // show DDMM again
        appWindow.focus();
        appWindow.webContents.send("running cover", {display: false});
        appWindow.webContents.send("got installs", InstallList.getInstallList());
    }).catch(err => {
        richPresence.setIdleStatus();
        appWindow.restore();
        appWindow.focus();
        appWindow.webContents.send("running cover", {
            display: true,
            dismissable: true,
            title: lang.translate("running_cover.error.title"),
            description: err
        });
    });
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

// Show file in file manager
ipcMain.on("show file", (ev: IpcMessageEvent, path: string) => {
    shell.showItemInFolder(path);
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
    launchInstall(folderName);
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

// desktop shortcut creation
ipcMain.on("create shortcut", (ev: IpcMessageEvent, folderName: string) => {
    if (process.platform !== "win32") {
        dialog.showErrorBox("Shortcut creation is only supported on Windows", "Nice try.");
        return;
    }

    dialog.showSaveDialog(appWindow, {
        title: lang.translate("mods.shortcut.dialog_title"),
        filters: [
            {name: lang.translate("mods.shortcut.file_format_name"), extensions: ["lnk"]}
        ]
    }, (file) => {
        if (file) {
            console.log("Writing shortcut to " + file);
            if (!shell.writeShortcutLink(file, "create", {
                args: "ddmm://launch-install/" + folderName,
                target: process.argv0
            })) {
                showError(
                    lang.translate("mods.shortcut.error_title"),
                    lang.translate("mods.shortcut.error_message"),
                    null,
                    false
                );
            }
        }
    });
});

// move installation folder
ipcMain.on("move install", () => {
    dialog.showOpenDialog(appWindow, {
        title: lang.translate("main.move_install.title"),
        properties: ["openDirectory"]
    }, filePaths => {
        if (filePaths && filePaths[0]) {
            appWindow.hide();
            const oldInstallFolder: string = Config.readConfigValue("installFolder");
            const newInstallFolder: string = joinPath(filePaths[0], "DDMM_GameData");
            move(oldInstallFolder, newInstallFolder, {overwrite: false}, e => {
                if (e) {
                    console.log(e);
                    dialog.showErrorBox(lang.translate("main.move_install.error_title"), lang.translate("main.move_install.error_description"));
                } else {
                    Config.saveConfigValue("installFolder", newInstallFolder);
                }
                app.relaunch();
                app.quit();
            });
        }
    });
});

// Get available backgrounds
ipcMain.on("get backgrounds", (ev: IpcMessageEvent) => {
    ev.returnValue = readdirSync(joinPath(__dirname, "../renderer/images/backgrounds"));
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
function handleURL(forcedArg?: string) {
    // logic for handling various command line arguments
    const url = forcedArg ? forcedArg : lastArg;
    if (url.startsWith("ddmm://")) {
        const command: string = url.split("ddmm://")[1];

        if (command.startsWith("launch-install/")) {
            const installFolder: string = command.split("launch-install/")[1];
            launchInstall(installFolder);
        }
    }
}

app.on("second-instance", (ev: Event, argv: string[]) => {
    appWindow.restore();
    appWindow.focus();
    handleURL(argv.pop());
});

app.on("ready", () => {
    app.setAppUserModelId("space.doki.modmanager");

    if (!app.requestSingleInstanceLock()) {

        // we should quit, as another instance is running
        console.log("App already running.");
        app.quit();
        return; // avoid running for longer than needed
    }

    if (
        !existsSync(joinPath(Config.readConfigValue("installFolder"), "mods")) ||
        !existsSync(joinPath(Config.readConfigValue("installFolder"), "installs"))
    ) {
        console.log("Creating directory structure");
        mkdirpSync(joinPath(Config.readConfigValue("installFolder"), "mods"));
        mkdirpSync(joinPath(Config.readConfigValue("installFolder"), "installs"));
    }

    app.setAsDefaultProtocolClient("ddmm");

    // create browser window
    appWindow = new BrowserWindow({
        title: "Doki Doki Mod Manager",
        width: 1024,
        height: 600,
        minWidth: 1000,
        minHeight: 600,
        maximizable: true,
        frame: false,
        webPreferences: {
            sandbox: true,
            nodeIntegration: false,
            preload: joinPath(__dirname, "../renderer/js-preload/preload.js") // contains all the IPC scripts
        },
        titleBarStyle: "hiddenInset",
        show: false
    });

    // Activate download manager
    downloadManager = new DownloadManager(appWindow);

    // TODO: implement this as an actual feature
    // DDLCDownloader.getDownloadLink().then(link => {
    //     downloadManager.downloadFile(link, "C:\\DDMM\\ddlc.zip");
    // });

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

    appWindow.on("ready-to-show", () => {
        handleURL();
    });

    appWindow.setMenu(null);

    if (process.env.DDMM_DEVTOOLS) {
        appWindow.webContents.openDevTools({mode: "detach"});
    }

    appWindow.loadFile(joinPath(__dirname, "../renderer/html/index.html"));
});
// endregion