import {app, BrowserWindow, dialog, ipcMain, IpcMainEvent, Notification, SaveDialogReturnValue, shell} from "electron";
import {copyFileSync, existsSync, mkdirpSync, move, readdirSync, removeSync, statSync, unlinkSync} from "fs-extra";
import {join as joinPath} from "path";
import {autoUpdater} from "electron-updater";
import * as Sentry from "@sentry/electron";
import * as semver from "semver";
import {sync as getDataURI} from "datauri";
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
import {checkSync, DiskUsage} from "diskusage";
import OpenDialogReturnValue = Electron.OpenDialogReturnValue;

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

// Onboarding manager
let onboardingManager: OnboardingManager;

let lang: I18n = new I18n();

// endregion

// region IPC functions

/**
 * Shows an error message in the UI
 * @param error A stacktrace to show on the frontend
 * @param fatal Whether the app needs to restart or not
 */
function showError(error: Error, fatal: boolean) {
    appWindow.webContents.send("error message", {
        fatal,
        stacktrace: error.stack
    });

    appWindow.setClosable(true);
}

/**
 * Launches an install, handling frontend functionality automatically
 * @param folderName The folder containing the install
 */
async function launchInstall(folderName): Promise<void> {
    appWindow.webContents.send("running cover", {
        display: true,
        folder_path: joinPath(Config.readConfigValue("installFolder"), "installs", folderName)
    });
    Config.saveConfigValue("lastLaunchedInstall", folderName);
    appWindow.minimize(); // minimise the window to draw attention to the fact another window will be appearing
    InstallLauncher.launchInstall(folderName, richPresence).then(() => {
        appWindow.restore(); // show DDMM again
        appWindow.focus();
        appWindow.webContents.send("running cover", {display: false});
        appWindow.webContents.send("got installs", InstallList.getInstallList());
    }).catch(() => {
        appWindow.restore();
        appWindow.focus();
        appWindow.webContents.send("running cover", {
            display: true,
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
ipcMain.on("translate", (ev: IpcMainEvent, query: { key: string, args: string[] }) => {
    let passArgs: string[] = query.args;
    passArgs.unshift(query.key);
    ev.returnValue = lang.translate.apply(lang, passArgs);
});

// Open external URLs
ipcMain.on("open url", (ev: IpcMainEvent, url: string) => {
    shell.openExternal(url);
});

// Show file in file manager
ipcMain.on("show file", (ev: IpcMainEvent, path: string) => {
    shell.showItemInFolder(path);
});

// Config IPC functions
ipcMain.on("save config", (ev: IpcMainEvent, configData: { key: string, value: any }) => {
    Config.saveConfigValue(configData.key, configData.value);
});

ipcMain.on("read config", (ev: IpcMainEvent, key: string) => {
    ev.returnValue = Config.readConfigValue(key);
});

// Launch install
ipcMain.on("launch install", (ev: IpcMainEvent, folderName: string) => {
    launchInstall(folderName);
});

// Browse for a mod
ipcMain.on("browse mods", (ev: IpcMainEvent) => {
    const extensions = ["zip", "gz", "tar", "7z"];
    dialog.showOpenDialog(appWindow, {
        title: lang.translate("main.mod_browse_dialog.title"),
        filters: [{
            extensions: extensions,
            name: lang.translate("main.mod_browse_dialog.file_format_name")
        }],
    }).then((res: OpenDialogReturnValue) => {
        if (res.filePaths && res.filePaths[0] && extensions.find(ext => (res.filePaths[0].endsWith("." + ext)))) {
            ev.returnValue = res.filePaths[0];
        } else {
            ev.returnValue = null;
        }
    });
});

// Trigger install creation
ipcMain.on("create install", (ev: IpcMainEvent, install: { folderName: string, installName: string, globalSave: boolean, mod: string }) => {
    appWindow.setClosable(false);
    console.log("[IPC create install] Creating install in " + install.folderName);
    InstallCreator.createInstall(install.folderName, install.installName, install.globalSave).then(() => {
        if (!install.mod) {
            appWindow.webContents.send("got installs", InstallList.getInstallList());
            appWindow.setClosable(true);
        } else {
            console.log("[IPC create install] Installing mod " + install.mod + " in " + install.folderName);
            ModInstaller.installMod(install.mod, joinPath(Config.readConfigValue("installFolder"), "installs", install.folderName, "install")).then(() => {
                appWindow.webContents.send("got installs", InstallList.getInstallList());
                appWindow.setClosable(true);
            }).catch((e: Error) => {
                appWindow.webContents.send("got installs", InstallList.getInstallList());
                showError(
                    e,
                    false
                );
            });
        }
    }).catch((e: Error) => {
        appWindow.webContents.send("got installs", InstallList.getInstallList());
        showError(
            e,
            false
        );
    });
});

// Rename an install
ipcMain.on("rename install", (ev: IpcMainEvent, options: { folderName: string, newName: string }) => {
    console.log("[IPC rename install] Renaming " + options.folderName);
    InstallManager.renameInstall(options.folderName, options.newName).then(() => {
        console.log("[IPC rename install] Renamed " + options.folderName);
        appWindow.webContents.send("got installs", InstallList.getInstallList());
    }).catch((e: Error) => {
        showError(
            e,
            false
        );
    });
});

// Delete an install permanently
ipcMain.on("delete install", (ev: IpcMainEvent, folderName: string) => {
    console.log("[IPC delete install] Deleting " + folderName);
    InstallManager.deleteInstall(folderName).then(() => {
        console.log("[IPC delete install] Deleted " + folderName);
        appWindow.webContents.send("got installs", InstallList.getInstallList());
    }).catch((e: Error) => {
        showError(
            e,
            false
        );
    });
});

// Delete a mod
ipcMain.on("delete mod", (ev: IpcMainEvent, fileName: string) => {
    console.log("[IPC delete mod] Deleting " + fileName);
    try {
        unlinkSync(joinPath(Config.readConfigValue("installFolder"), "mods", fileName));
        console.log("[IPC delete mod] Deleted " + fileName);
        appWindow.webContents.send("got modlist", modList.getModList());
    } catch (e) {
        showError(
            e,
            false
        );
    }
});

// Delete a save file for an install
ipcMain.on("delete save", (ev: IpcMainEvent, folderName: string) => {
    console.log("[IPC delete save] Deleting save data for " + folderName);
    InstallManager.deleteSaveData(folderName).then(() => {
        console.log("[IPC delete save] Deleted save data for " + folderName);
        appWindow.webContents.send("got installs", InstallList.getInstallList());
    }).catch((e: Error) => {
        showError(
            e,
            false
        );
    });
});

// Sets install category
ipcMain.on("set category", (ev: IpcMainEvent, options: { folderName: string, category: string }) => {
    console.log("[IPC set category] Setting category for " + options.folderName + " to " + options.category);
    InstallManager.setCategory(options.folderName, options.category).then(() => {
        console.log("[IPC set category] Set category");
        appWindow.webContents.send("got installs", InstallList.getInstallList());
    }).catch((e: Error) => {
        showError(
            e,
            false
        );
    });
});

// desktop shortcut creation
ipcMain.on("create shortcut", (ev: IpcMainEvent, options: { folderName: string, installName: string }) => {
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
    }).then((dialogReturn: SaveDialogReturnValue) => {
        const file: string = dialogReturn.filePath;
        if (file) {
            console.log("[IPC create shortcut] Writing shortcut to " + file);
            if (!shell.writeShortcutLink(file, "create", {
                target: "ddmm://launch-install/" + options.folderName,
                icon: process.execPath,
                iconIndex: 0
            })) {
                showError(
                    new Error("Attempt to write shortcut failed"),
                    false
                );
            } else {
                console.log("[IPC create shortcut] Written shortcut to " + file);
            }
        }
    });
});

ipcMain.on("get install background", (ev: IpcMainEvent, folder: string) => {
    const installFolder: string = joinPath(Config.readConfigValue("installFolder"), "installs");

    let bgPath: string = joinPath(installFolder, folder, "ddmm-bg.png");
    let bgDataURL: string;

    let screenshots: string[] = [];

    try {
        screenshots = readdirSync(joinPath(installFolder, folder, "install")).filter(fn => {
            return fn.match(/^screenshot(\d+)\.png$/);
        });
    } catch (e) {
        console.log("Could not load screenshots due to an IO error", e.message);
    }

    if (existsSync(bgPath)) {
        bgDataURL = getDataURI(bgPath);
    } else if (screenshots.length > 0) {
        bgDataURL = getDataURI(joinPath(installFolder, folder, "install", screenshots[Math.floor(Math.random() * screenshots.length)]));
    }

    ev.returnValue = bgDataURL;
});

// Check if install exists
ipcMain.on("install exists", (ev: IpcMainEvent, folderName: string) => {
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
    }).then((res: OpenDialogReturnValue) => {
        if (res.filePaths && res.filePaths[0]) {
            appWindow.hide();
            const oldInstallFolder: string = Config.readConfigValue("installFolder");
            const newInstallFolder: string = joinPath(res.filePaths[0], "DDMM_GameData");
            if (!existsSync(newInstallFolder) || !statSync(newInstallFolder).isDirectory()) {
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
            } else {
                Config.saveConfigValue("installFolder", newInstallFolder);
                app.relaunch();
                app.quit();
            }
        }
    });
});

// Get available backgrounds
ipcMain.on("get backgrounds", (ev: IpcMainEvent) => {
    ev.returnValue = readdirSync(joinPath(__dirname, "../../src/renderer/images/backgrounds"));
});

// Crash for debugging
ipcMain.on("debug crash", () => {
    throw new Error("User forced debug crash with DevTools");
});

// Disk space check
ipcMain.on("disk space", (ev: IpcMainEvent) => {
    const usage: DiskUsage = checkSync(Config.readConfigValue("installFolder"));
    ev.returnValue = usage.free;
});

ipcMain.on("import mas", (ev: IpcMainEvent, folderName: string) => {
    dialog.showOpenDialog(appWindow, {
        title: lang.translate("main.import_mas.title"),
        filters: [
            {
                name: lang.translate("main.import_mas.filter"),
                extensions: ["*"]
            }
        ]
    }).then((res: OpenDialogReturnValue) => {
        if (res.filePaths && res.filePaths[0]) {
            copyFileSync(res.filePaths[0], joinPath(Config.readConfigValue("installFolder"), "installs", folderName, "install", "characters", "monika"));
            removeSync(res.filePaths[0]);
            InstallManager.setMonikaExported(folderName, false).then(() => {
                appWindow.webContents.send("got installs", InstallList.getInstallList());
            });
        }
    });
});

ipcMain.on("export mas", (ev: IpcMainEvent, folderName: string) => {
    dialog.showSaveDialog(appWindow, {
        title: lang.translate("main.export_mas.title"),
        defaultPath: "monika",
        filters: [
            {
                name: lang.translate("main.export_mas.filter"),
                extensions: ["*"]
            }
        ]
    }).then((dialogReturn: SaveDialogReturnValue) => {
        console.log(dialogReturn);
        if (dialogReturn.filePath) {
            console.log("exporting");
            const source: string = joinPath(Config.readConfigValue("installFolder"), "installs", folderName, "install", "characters", "monika");
            copyFileSync(source, dialogReturn.filePath);
            removeSync(source);
            console.log("exported");
            InstallManager.setMonikaExported(folderName, true).then(() => {
                appWindow.webContents.send("got installs", InstallList.getInstallList());
            });
        }
    });
});

ipcMain.on("reload languages", () => {
    lang = new I18n();
});

// endregion

// region Onboarding

// Download start
ipcMain.on("onboarding download", () => {
    console.log("Starting game download");
    onboardingManager.downloadGame().then(() => {
        appWindow.flashFrame(true);
        OnboardingManager.requiresOnboarding().then(() => {
            appWindow.webContents.send("onboarding downloaded");
        }).catch(() => {
            // TODO: show a message and try again
        });
    }).catch(e => {
        removeSync(joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"));
        console.warn("Failed to download game in onboarding: " + e);
        appWindow.webContents.send("onboarding download failed");
    });
});

// Import start
ipcMain.on("onboarding browse", () => {
    dialog.showOpenDialog(appWindow, {
        filters: [
            {name: lang.translate("main.game_browse_dialog.file_format_name"), extensions: ["zip"]}
        ],
        title: lang.translate("main.game_browse_dialog.title")
    }).then((res: OpenDialogReturnValue) => {
        if (res.filePaths && res.filePaths[0] && res.filePaths[0].endsWith(".zip")) {
            try {
                copyFileSync(res.filePaths[0], joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"));
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
    showUpdating("checking");
    autoUpdater.checkForUpdatesAndNotify().then(update => {
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
        e,
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
        // title: "Doki Doki Mod Manager",
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
            nativeWindowOpen: true,
            preload: joinPath(__dirname, "../../src/renderer/js-preload/preload.js") // contains all the IPC scripts
        },
        titleBarStyle: "hiddenInset",
        show: false
    });

    // Activate download manager
    downloadManager = new DownloadManager(appWindow);

    // ...and the onboarding manager
    onboardingManager = new OnboardingManager(downloadManager);

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
    appWindow.webContents.userAgent = USER_AGENT;

    appWindow.webContents.on("will-navigate", (ev, url) => {
        console.warn("Prevented navigation from app container", url);
        ev.preventDefault(); // prevent navigation
    });

    appWindow.on("ready-to-show", () => {
        appWindow.show();

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
        if (downloadManager.hasDownloads()) {
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
    appWindow.setMenuBarVisibility(false);

    const uiSubdomain: string = "v" + app.getVersion().replace(/\./g, "-");

    appWindow.webContents.once("did-fail-load", () => {
        if (Config.readConfigValue("localUI")) {
            dialog.showErrorBox(lang.translate("main.errors.dev_ui_load_fail.title"), lang.translate("main.errors.dev_ui_load_fail.body"));
            appWindow.loadURL(`https://${uiSubdomain}.ui.doki.space`);
        } else {
            const lastVersion: string = Config.readConfigValue("lastKnownGoodVersion");
            if (app.getVersion() !== lastVersion) { // if there is an older version available
                appWindow.loadURL(`https://${lastVersion}.ui.doki.space`);
            } else {
                appWindow.loadFile(joinPath(__dirname, "../../src/renderer/html/offline.html"))
            }
        }
    });

    if (Config.readConfigValue("localUI")) {
        appWindow.loadURL("http://localhost:1234/");
    } else {
        appWindow.loadURL(`https://${uiSubdomain}.ui.doki.space`);
    }

    appWindow.setTitle("Doki Doki Mod Manager");

    if (!Config.readConfigValue("installFolder", true)) {
        Config.saveConfigValue("installFolder", Config.readConfigValue("installFolder"));
    }
});
// endregion
