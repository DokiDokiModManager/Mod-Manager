import {app, BrowserWindow, ipcMain, IpcMessageEvent, shell, dialog, Notification} from "electron";
import {move, existsSync, mkdirpSync, readdirSync, removeSync, copyFileSync} from "fs-extra";
import {join as joinPath} from "path";
import {autoUpdater} from "electron-updater";
import * as Sentry from "@sentry/electron";
import * as semver from "semver";

// Check if running from Windows Store
const isAppx: boolean = (process.execPath.indexOf("WindowsApps") !== -1);

Sentry.init({
    dsn: "https://bf0edf3f287344d4969e3171c33af4ea@sentry.io/1297252",
    onFatalError: () => {
        // workaround for stacktrace being displayed (see getsentry/sentry-electron#146)
    }
});

// One of my major regrets in life is putting an ! at the end of the application name
// This should allow me to use a sane directory name but not break old installs.
if (existsSync(joinPath(app.getPath("appData"), "Doki Doki Mod Manager!"))) {
    console.log("Overriding app data path");
    app.setPath("userData", joinPath(app.getPath("appData"), "Doki Doki Mod Manager!"));
} else {
    app.setPath("userData", joinPath(app.getPath("appData"), "DokiDokiModManager"));
}

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
import OnboardingManager from "./onboarding/OnboardingManager";
import {readFileSync, unlinkSync} from "fs";
import InstallSync from "./cloud/InstallSync";
import Timeout = NodeJS.Timeout;

const DISCORD_ID = "453299645725016074";

// region Flags and references

// User agent for API requests
const USER_AGENT = "DokiDokiModManager/" + app.getVersion() + " (zudo@doki.space)";

// The last argument, might be a ddmm:// url
const lastArg: string = process.argv.pop();

// Permanent reference to the main app window
let appWindow: BrowserWindow;

// Discord rich presence
let richPresence: DiscordManager = new DiscordManager(process.env.DDMM_DISCORD_ID || DISCORD_ID);

richPresence.setIdleStatus();

// Mod list
let modList: ModList;

// Download manager
let downloadManager: DownloadManager;

// Flag for allowing the app window to be closed
let windowClosable: boolean = true;

const lang: I18n = new I18n(Config.readConfigValue("language") || app.getLocale());

// endregion

// region IPC functions

/**
 * Shows an error message in the UI
 * @param title The title of the error
 * @param body Some more description text
 * @param stacktrace A stacktrace to show on the frontend
 * @param fatal Whether the app needs to restart or not
 */
function showError(title: string, body: string, stacktrace: string, fatal: boolean) {
    appWindow.webContents.send("error message", {
        title, body, fatal, stacktrace
    });

    windowClosable = true;
    appWindow.setClosable(true);
}

function getCloudSaveData(folderName: string): Promise<{url: string, name: string}> {
    return new Promise((ff, rj) => {
        const installDataFile: string = joinPath(Config.readConfigValue("installFolder"), "installs", folderName, "install.json");
        let installData: any;
        try {
            installData =
                JSON.parse(readFileSync(installDataFile).toString("utf8"));

            if (installData.cloudSave) {
                appWindow.webContents.send("get save url", installData.cloudSave);
                ipcMain.once("got save url", (_, url) => {
                    ff({url, name: installData.cloudSave});
                });
            } else {
                ff(null);
            }
        } catch (e) {
            rj();
            return;
        }
    });
}

/**
 * Launches an install, handling frontend functionality automatically
 * @param folderName The folder containing the install
 */
async function launchInstall(folderName): Promise<void> {
    let lockTimer: Timeout;
    Config.saveConfigValue("lastLaunchedInstall", folderName);
    appWindow.minimize(); // minimise the window to draw attention to the fact another window will be appearing
    const saveData: {url: string, name: string} = await getCloudSaveData(folderName);
    if (saveData) {
        appWindow.webContents.send("lock save", saveData.name);
        lockTimer = setInterval(() => {
            appWindow.webContents.send("lock save", saveData.name);
        }, 30000);
    }
    if (saveData && saveData.url) {
        await InstallSync.installSaveData(folderName, saveData.url);
    }
    appWindow.webContents.send("running cover", {
        display: true,
        dismissable: false,
        title: lang.translate("main.running_cover.title_running"),
        description: lang.translate("main.running_cover.description_running"),
        folder_path: joinPath(Config.readConfigValue("installFolder"), "installs", folderName)
    });
    InstallLauncher.launchInstall(folderName, richPresence).then(() => {
        appWindow.restore(); // show DDMM again
        appWindow.focus();
        appWindow.webContents.send("running cover", {display: false});
        appWindow.webContents.send("got installs", InstallList.getInstallList());
        if (saveData) {
            console.log("Compressing save data");
            InstallSync.compressSaveData(folderName).then(pathToSave => {
                appWindow.webContents.send("upload save", {
                    localURL: pathToSave,
                    filename: saveData.name
                });
                clearTimeout(lockTimer);
            }).catch(e => {
                // TODO: talk about the error
            });
        }
    }).catch(err => {
        appWindow.restore();
        appWindow.focus();
        clearTimeout(lockTimer);
        appWindow.webContents.send("unlock save", saveData.name);
        appWindow.webContents.send("running cover", {
            display: true,
            dismissable: true,
            title: lang.translate("main.running_cover.title_crashed"),
            description: err,
            folder_path: joinPath(Config.readConfigValue("installFolder"), "installs", folderName)
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
    appWindow.webContents.send("got modlist", modList.getModList());
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
    const extensions = ["zip", "gz", "tar", "rar", "7z"];
    dialog.showOpenDialog(appWindow, {
        title: lang.translate("main.mod_browse_dialog.title"),
        filters: [{
            extensions: extensions,
            name: lang.translate("main.mod_browse_dialog.file_format_name")
        }],
    }, (filePaths: string[]) => {
        if (filePaths && filePaths[0] && extensions.find(ext => (filePaths[0].endsWith("." + ext)))) {
            ev.returnValue = filePaths[0];
        } else {
            ev.returnValue = null;
        }
    });
});

// Trigger install creation
ipcMain.on("create install", (ev: IpcMessageEvent, install: { folderName: string, installName: string, globalSave: boolean, mod: string, cloudSave: string }) => {
    windowClosable = false;
    appWindow.setClosable(false);
    console.log("[IPC create install] Creating install in " + install.folderName);
    InstallCreator.createInstall(install.folderName, install.installName, install.globalSave, install.cloudSave).then(() => {
        if (!install.mod) {
            appWindow.webContents.send("got installs", InstallList.getInstallList());
            windowClosable = true;
            appWindow.setClosable(true);
        } else {
            console.log("[IPC create install] Installing mod " + install.mod + " in " + install.folderName);
            ModInstaller.installMod(install.mod, joinPath(Config.readConfigValue("installFolder"), "installs", install.folderName, "install")).then(() => {
                appWindow.webContents.send("got installs", InstallList.getInstallList());
                windowClosable = true;
                appWindow.setClosable(true);
            }).catch((e: Error) => {
                appWindow.webContents.send("got installs", InstallList.getInstallList());
                showError(
                    lang.translate("main.errors.install.title"),
                    lang.translate("main.errors.install.body"),
                    e.toString(),
                    false
                );
            });
        }
    }).catch((e: Error) => {
        appWindow.webContents.send("got installs", InstallList.getInstallList());
        showError(
            lang.translate("main.errors.install.title"),
            lang.translate("main.errors.install.body"),
            e.toString(),
            false
        );
    });
});

// Rename an install
ipcMain.on("rename install", (ev: IpcMessageEvent, options: { folderName: string, newName: string }) => {
    console.log("[IPC rename install] Renaming " + options.folderName);
    InstallManager.renameInstall(options.folderName, options.newName).then(() => {
        console.log("[IPC rename install] Renamed " + options.folderName);
        appWindow.webContents.send("got installs", InstallList.getInstallList());
    }).catch((e: Error) => {
        showError(
            lang.translate("main.errors.rename.title"),
            lang.translate("main.errors.rename.body"),
            e.toString(),
            false
        );
    });
});

// Delete an install permanently
ipcMain.on("delete install", (ev: IpcMessageEvent, folderName: string) => {
    console.log("[IPC delete install] Deleting " + folderName);
    InstallManager.deleteInstall(folderName).then(() => {
        console.log("[IPC delete install] Deleted " + folderName);
        appWindow.webContents.send("got installs", InstallList.getInstallList());
    }).catch((e: Error) => {
        showError(
            lang.translate("main.errors.uninstall.title"),
            lang.translate("main.errors.uninstall.body"),
            e.toString(),
            false
        );
    });
});

// Delete a mod
ipcMain.on("delete mod", (ev: IpcMessageEvent, fileName: string) => {
    console.log("[IPC delete mod] Deleting " + fileName);
    try {
        unlinkSync(joinPath(Config.readConfigValue("installFolder"), "mods", fileName));
        console.log("[IPC delete mod] Deleted " + fileName);
        appWindow.webContents.send("got modlist", modList.getModList());
    } catch (e) {
        showError(
            lang.translate("main.errors.mod_delete.title"),
            lang.translate("main.errors.mod_delete.body"),
            e.toString(),
            false
        );
    }
});

// Delete a save file for an install
ipcMain.on("delete save", (ev: IpcMessageEvent, folderName: string) => {
    console.log("[IPC delete save] Deleting save data for " + folderName);
    InstallManager.deleteSaveData(folderName).then(() => {
        console.log("[IPC delete save] Deleted save data for " + folderName);
        appWindow.webContents.send("got installs", InstallList.getInstallList());
    }).catch((e: Error) => {
        showError(
            lang.translate("main.errors.save_delete.title"),
            lang.translate("main.errors.save_delete.body"),
            e.toString(),
            false
        );
    });
});

// desktop shortcut creation
ipcMain.on("create shortcut", (ev: IpcMessageEvent, options: { folderName: string, installName: string }) => {
    if (process.platform !== "win32") {
        dialog.showErrorBox("Shortcut creation is only supported on Windows", "Nice try.");
        return;
    }

    dialog.showSaveDialog(appWindow, {
        title: lang.translate("main.shortcut_dialog.title"),
        defaultPath: options.installName,
        filters: [
            {name: lang.translate("main.shortcut_dialog.file_format_name"), extensions: ["lnk"]}
        ]
    }, (file) => {
        if (file) {
            console.log("[IPC create shortcut] Writing shortcut to " + file);
            if (!shell.writeShortcutLink(file, "create", {
                target: "ddmm://launch-install/" + options.folderName,
                icon: process.execPath,
                iconIndex: 0
            })) {
                showError(
                    lang.translate("main.errors.shortcut.title"),
                    lang.translate("main.errors.shortcut.body"),
                    null,
                    false
                );
            } else {
                console.log("[IPC create shortcut] Written shortcut to " + file);
            }
        }
    });
});

// Check if install exists
ipcMain.on("install exists", (ev: IpcMessageEvent, folderName: string) => {
    if (!folderName || typeof folderName !== "string") {
        console.warn("[IPC install exists] Folder name should be a string, received " + typeof folderName);
        ev.returnValue = false;
        return;
    }
    ev.returnValue = InstallManager.installExists(folderName);
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
                    dialog.showErrorBox(lang.translate("main.errors.move_install.title"), lang.translate("main.errors.move_install.body"));
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
    ev.returnValue = readdirSync(joinPath(__dirname, "../../src/renderer/images/backgrounds"));
});

// Crash for debugging
ipcMain.on("debug crash", () => {
    throw new Error("User forced debug crash with DevTools")
});

// endregion

// region Onboarding

// Import start
ipcMain.on("onboarding browse", () => {
    dialog.showOpenDialog(appWindow, {
        filters: [
            {name: lang.translate("main.game_browse_dialog.file_format_name"), extensions: ["zip"]}
        ],
        title: lang.translate("main.game_browse_dialog.title")
    }, (files: string[]) => {
        if (files && files[0] && files[0].endsWith(".zip")) {
            try {
                copyFileSync(files[0], joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"));
                OnboardingManager.requiresOnboarding().then(() => {
                    appWindow.webContents.send("onboarding downloaded");
                }).catch(() => {
                    // TODO: show a message and try again
                });
            } catch (e) {
                // TODO: catch any FS errors
            }
        }
    });
});

ipcMain.on("download mod", (ev, url) => {
    downloadManager.downloadFile(url, joinPath(Config.readConfigValue("installFolder"), "mods"), null, "DOWNLOADED_MOD");
});

// endregion

// region Updates etc.
function showUpdating(status: "checking" | "available" | "downloading" | "downloaded" | "none") {
    if (appWindow && appWindow.webContents) {
        appWindow.webContents.send("updating", status);
    }
}

function checkForUpdate() {
    if (isAppx) return; // don't update if windows store
    showUpdating("checking");
    autoUpdater.checkForUpdatesAndNotify().then(update => {
        console.log(update);
        if (update && semver.gt(update.updateInfo.version, app.getVersion())) {
            showUpdating("available");
        } else {
            showUpdating("none");
        }
    }).catch(err => {
        console.warn("Error checking for updates", err);
        showUpdating("none");
    });
}

autoUpdater.autoDownload = false;

autoUpdater.on("update-downloaded", () => {
    showUpdating("downloaded");
});

ipcMain.on("check update", () => {
    checkForUpdate();
});

ipcMain.on("download update", () => {
    showUpdating("downloading");
    autoUpdater.downloadUpdate();
});

checkForUpdate();

// endregion

// region Global exception handler
process.on("uncaughtException", (e: Error) => {
    console.log("Uncaught exception occurred - treating this as a crash.");
    console.error(e);
    showError(
        lang.translate("main.errors.exception.title"),
        lang.translate("main.errors.exception.body"),
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
        } else if (command.startsWith("auth-handoff/")) {
            const url = new Buffer(command.split("auth-handoff/")[1], "base64").toString("utf8");
            appWindow.webContents.send("auth handoff", url);
        }
    }
}

app.on("second-instance", (ev: Event, argv: string[]) => {
    appWindow.restore();
    appWindow.focus();
    handleURL(argv.pop());
});

app.on("ready", () => {
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

    // set protocol handler
    app.setAsDefaultProtocolClient("ddmm");

    // create browser window
    appWindow = new BrowserWindow({
        title: "Doki Doki Mod Manager",
        width: 1024,
        height: 600,
        minWidth: 1000,
        minHeight: 600,
        maximizable: true,
        frame: !!Config.readConfigValue("systemBorders"),
        useContentSize: true,
        webPreferences: {
            contextIsolation: false,
            sandbox: true,
            nodeIntegration: false,
            preload: joinPath(__dirname, "../../src/renderer/js-preload/preload.js") // contains all the IPC scripts
        },
        titleBarStyle: "hiddenInset",
        show: false
    });

    // Activate download manager
    downloadManager = new DownloadManager(appWindow);

    // ...and the mod list
    modList = new ModList(downloadManager);

    downloadManager.on("download progress", (data: { filename: string, downloaded: number, total: number, startTime: number, meta?: any }) => {
        appWindow.webContents.send("download progress", data);
    });

    downloadManager.on("download stalled", (data: { filename: string, downloaded: number, total: number, startTime: number, meta?: any }) => {
        appWindow.webContents.send("download stalled", data);
    });

    downloadManager.on("download started", () => {
        appWindow.webContents.send("got modlist", modList.getModList());
    });

    downloadManager.on("download complete", () => {
        appWindow.webContents.send("got modlist", modList.getModList());
    });

    downloadManager.on("download failed", () => {
        appWindow.webContents.send("got modlist", modList.getModList());
    });

    // set user agent so web services can contact me if necessary
    appWindow.webContents.setUserAgent(USER_AGENT);

    appWindow.webContents.on("will-navigate", (ev, url) => {
        console.warn("Prevented navigation from app container", url);
        ev.preventDefault(); // prevent navigation
    });

    appWindow.webContents.on("did-finish-load", () => {
        if (!appWindow.isVisible()) {
            appWindow.show();
        }
        appWindow.webContents.send("is appx", isAppx);
        appWindow.webContents.send("debug info", {
            "Platform": process.platform,
            "Node Environment": process.env.NODE_ENV || "none",
            "Discord Client ID": process.env.DDMM_DISCORD_ID || DISCORD_ID,
            "Background": Config.readConfigValue("background"),
            "Node Version": process.version,
            "Electron Version": process.versions.electron,
            "Chrome Version": process.versions.chrome,
            "Locale": app.getLocale(),
            "Install Folder": Config.readConfigValue("installFolder"),
            "AppX": isAppx
        });

        OnboardingManager.requiresOnboarding().catch(e => {
            console.warn("Onboarding required - reason: " + e);
            appWindow.webContents.send("start onboarding");
        });
    });

    appWindow.webContents.on("crashed", () => {
        const crashNotif = new Notification({
            title: lang.translate("main.errors.exception.title"),
            body: lang.translate("main.errors.exception.body"),
        });

        crashNotif.show();
        app.quit();
    });

    appWindow.on("unresponsive", () => {
        const freezeNotif = new Notification({
            title: lang.translate("main.errors.renderer_freeze.title"),
            body: lang.translate("main.errors.renderer_freeze.body"),
        });

        freezeNotif.show();
    });

    appWindow.on("close", e => {
        if (downloadManager.hasDownloads() || !windowClosable) {
            e.preventDefault();
        }
    });

    appWindow.on("closed", () => {
        appWindow = null;
        app.quit();
    });

    appWindow.webContents.once("did-finish-load", () => {
        handleURL();
    });

    appWindow.setMenu(null);

    if (process.env.DDMM_DEVTOOLS) {
        appWindow.webContents.openDevTools({mode: "detach"});
    }

    appWindow.loadFile(joinPath(__dirname, "../../src/renderer/html/index.html"));

    if (!Config.readConfigValue("installFolder", true)) {
        Config.saveConfigValue("installFolder", Config.readConfigValue("installFolder"));
    }
});
// endregion