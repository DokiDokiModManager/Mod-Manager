import Logger from "./utils/Logger";

import {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    IpcMainEvent,
    Notification,
    SaveDialogReturnValue,
    OpenDialogReturnValue,
    shell,
    DownloadItem,
    IpcMainInvokeEvent
} from "electron";

global.ddmm_constants = require("./constants/global");

console.dir(global.ddmm_constants);

import * as Sentry from "@sentry/electron";

if (!global.ddmm_constants.sentry_disabled) {
    Sentry.init({
        dsn: "https://bf0edf3f287344d4969e3171c33af4ea@sentry.io/1297252",
        onFatalError: () => {
            // workaround for stacktrace being displayed (see getsentry/sentry-electron#146)
        }
    });
}

import {copyFileSync, existsSync, mkdirpSync, move, readdirSync, removeSync, unlinkSync} from "fs-extra";
import {join as joinPath} from "path";

if (existsSync(joinPath(app.getPath("appData"), "Doki Doki Mod Manager!"))) {
    Logger.info("Startup", "Prehistoric install folder found, using that.");
    app.setPath("userData", joinPath(app.getPath("appData"), "Doki Doki Mod Manager!"));
} else {
    app.setPath("userData", joinPath(app.getPath("appData"), "DokiDokiModManager"));
}

import DummyDiscordManager from "./discord/DummyDiscordManager";
import {autoUpdater, UpdateCheckResult} from "electron-updater";
import ModList from "./mod/ModList";
import I18n from "./i18n/i18n";
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
import IntegrityCheck from "./onboarding/IntegrityCheck";
import {downloadLanguageFile} from "./i18n/TranslationDownload";
import FeatureFlags from "./utils/FeatureFlags";
import SpecialCaseManager from "./mod/SpecialCaseManager";
import IDiscordManager from "./discord/IDiscordManager";
import BundledUIServer from "./utils/BundledUIServer";
import {initIPC} from "./ipc";

const DISCORD_ID = "453299645725016074";

// region Flags and references

// User agent for API requests
app.userAgentFallback = "DokiDokiModManager/" + app.getVersion() + " (zudo@doki.space)";

// The last argument, might be a ddmm:// url
const lastArg: string = process.argv.pop();

// Permanent reference to the main app window
let appWindow: BrowserWindow;

// Discord rich presence
let richPresence: IDiscordManager = global.ddmm_constants.discord_disabled ? new DummyDiscordManager() : new DiscordManager(process.env.DDMM_DISCORD_ID || DISCORD_ID);

richPresence.setIdleStatus();

// url to load the UI from
const uiURL: string = require("../../ddmm.json").ui;

// Feature flags
let featureFlags: FeatureFlags = new FeatureFlags();

// Special case data
const specialCaseManager: SpecialCaseManager = new SpecialCaseManager();

// Mod list
let modList: ModList;

// Download manager
let downloadManager: DownloadManager;

// Onboarding manager
let onboardingManager: OnboardingManager;

// Install launcher
let installLauncher: InstallLauncher;

// Localisation
mkdirpSync(joinPath(app.getPath("userData"), "language"));

let lang: I18n = new I18n();

downloadLanguageFile(Config.readConfigValue("language")).catch(err => {
    console.warn("Language update failed", err);
});

// endregion

// region Onboarding

ipcMain.on("onboarding scan", () => {
    // the user has likely saved ddlc to their downloads folder, check there.
    const guessPath: string = joinPath(app.getPath("downloads"), process.platform === "darwin" ? "ddlc-mac.zip" : "ddlc-win.zip");
    Logger.info("Onboarding", "Testing " + guessPath);
    if (existsSync(guessPath)) {
        Logger.info("Onboarding", "Download guess exists, checking...");
        IntegrityCheck.checkGameIntegrity(guessPath).then(version => {
            Logger.info("Onboarding", "Game found automatically!");
            appWindow.webContents.send("onboarding validated", {
                path: guessPath,
                success: true,
                version_match: (process.platform === "darwin" ? version === "mac" : version == "windows")
            });
        });
    } else {
        appWindow.webContents.send("onboarding validated", {
            path: guessPath,
            success: false,
            version_match: false
        });
    }
});

ipcMain.on("onboarding browse", (ev: IpcMainEvent) => {
    dialog.showOpenDialog(appWindow, {
        title: lang.translate("main.game_browse_dialog.title"),
        filters: [
            {
                name: lang.translate("main.game_browse_dialog.file_format_name"),
                extensions: ["zip"]
            }
        ]
    }).then((res: OpenDialogReturnValue) => {
        if (res.filePaths && res.filePaths[0]) {
            ev.returnValue = res.filePaths[0];
        } else {
            ev.returnValue = null;
        }
    });
});

ipcMain.on("onboarding validate", (ev: IpcMainEvent, path: string) => {
    IntegrityCheck.checkGameIntegrity(path).then(version => {
        appWindow.webContents.send("onboarding validated", {
            path,
            success: true,
            version_match: (process.platform === "darwin" ? version === "mac" : version == "windows")
        });
    }).catch(() => {
        appWindow.webContents.send("onboarding validated", {
            path, success: false, version_match: false
        });
    })
});

ipcMain.on("onboarding finalise", (ev: IpcMainEvent, ddlcPath: string) => {
    Logger.info("Onboarding", "Creating directory structure");
    mkdirpSync(joinPath(Config.readConfigValue("installFolder"), "mods"));
    mkdirpSync(joinPath(Config.readConfigValue("installFolder"), "installs"));
    mkdirpSync(joinPath(Config.readConfigValue("installFolder"), "downloads"));
    copyFileSync(ddlcPath, joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"));
});

ipcMain.on("download mod", (ev, url) => {
    downloadManager.downloadFile(url);
});

// endregion

// region Updates etc.
autoUpdater.autoDownload = false;

autoUpdater.on("download-progress", () => {
    appWindow.webContents.send("update status", "downloading");
});

autoUpdater.on("update-downloaded", () => {
    appWindow.webContents.send("update status", "downloaded");
});

ipcMain.on("download update", () => {
    autoUpdater.checkForUpdates().then((update: UpdateCheckResult) => {
        if (update) {
            autoUpdater.downloadUpdate();
        }
    })
});

// endregion

// region App initialisation
function handleURL(forcedArg?: string) {
    // logic for handling various command line arguments
    const url = forcedArg ? forcedArg : lastArg;
    if (url.startsWith("ddmm://")) {
        const commandParts: string[] = url.split("ddmm://")[1].split("/");
        const command: string = commandParts.shift();

        if (command === "launch-install") {
            const installFolder: string = commandParts[0];
            dialog.showErrorBox("Not yet implemented!", "Not yet implemented!");
            // launchInstall(installFolder);
        } else if (command === "download-mod") {
            const data: any = JSON.parse(Buffer.from(commandParts.join("/"), "base64").toString());
            if (data.filename && data.url) {
                const oldFilename: string = downloadManager.getPreloadedFilename();
                downloadManager.preloadFilename(data.filename);
                downloadManager.downloadFileWithInteraction(data.url).then(() => {
                    downloadManager.preloadFilename(oldFilename);
                });
            }
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
        Logger.info("Startup", "Another instance is running, quitting.");
        app.quit();
        return; // avoid running for longer than needed
    }

    // set protocol handler
    if (app.isPackaged) {
        app.setAsDefaultProtocolClient("ddmm");
    }

    // create browser window
    appWindow = new BrowserWindow({
        width: 1024,
        height: 600,
        minWidth: 1000,
        minHeight: 600,
        maximizable: true,
        frame: !!Config.readConfigValue("systemBorders"),
        useContentSize: true,
        webPreferences: {
            contextIsolation: true,
            sandbox: false,
            nodeIntegration: false,
            nativeWindowOpen: true,
            webviewTag: true,
            preload: joinPath(__dirname, "../../src/renderer/js-preload/preload.js") // contains all the IPC scripts
        },
        titleBarStyle: "hiddenInset",
        show: false,
        title: "Doki Doki Mod Manager" + (process.env.DDMM_DEVELOPER ? " - Development Mode" : "")
    });

    appWindow.on("page-title-updated", event => {
        event.preventDefault();
    });

    // Activate download manager
    downloadManager = new DownloadManager(appWindow, lang);

    // ...and the onboarding manager
    onboardingManager = new OnboardingManager();

    // ...and the mod list
    modList = new ModList(downloadManager);

    // ...and the install launcher
    installLauncher = new InstallLauncher();

    downloadManager.on("started", () => {
        appWindow.webContents.send("download started");
    });

    downloadManager.on("finished", () => {
        appWindow.webContents.send("got modlist", modList.getModList());
    });

    appWindow.webContents.on("will-navigate", (ev, url) => {
        console.warn("Prevented navigation from app container", url);
        ev.preventDefault(); // prevent navigation
    });

    appWindow.on("ready-to-show", () => {
        appWindow.show();
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

    appWindow.on("close", (ev: Event) => {
        if (downloadManager.hasActiveDownloads()) {
            ev.preventDefault();
        }
    });

    appWindow.on("closed", () => {
        appWindow = null;
        app.quit();
    });

    appWindow.webContents.on("did-finish-load", () => {
        OnboardingManager.requiresOnboarding().catch(e => {
            Logger.info("Onboarding", "Onboarding required - reason: " + e);
            appWindow.webContents.send("start onboarding");
        });
    });

    appWindow.webContents.once("did-finish-load", () => {
        handleURL();
    });

    if (!process.env.DDMM_DEVELOPER) {
        appWindow.setMenu(null);
        appWindow.setMenuBarVisibility(false);
    }

    initIPC({
        appWindow,
        downloadManager,
        featureFlags,
        installLauncher,
        lang,
        modList,
        richPresence,
        specialCaseManager
    });

    if (app.isPackaged) {
        BundledUIServer.start().then(port => {
            appWindow.loadURL(`http://localhost:${port}/`);
        });
    } else {
        appWindow.loadURL(`http://localhost:1234/`);
    }

    if (!Config.readConfigValue("installFolder", true)) {
        Config.saveConfigValue("installFolder", Config.readConfigValue("installFolder"));
    }

    Logger.info("Startup", "Application startup complete!");
});
// endregion
