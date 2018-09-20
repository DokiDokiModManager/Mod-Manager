"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const crypto_1 = require("crypto");
const electron_1 = require("electron");
const isDev = require("electron-is-dev");
const electron_updater_1 = require("electron-updater");
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const request = require("request");
const normaliseName = require("sanitize-filename");
const sha_1 = require("sha");
const RichPresence_1 = require("./discord/RichPresence");
const DownloadLinkRetriever_1 = require("./download/DownloadLinkRetriever");
const Config_1 = require("./files/Config");
const DirectoryManager_1 = require("./files/DirectoryManager");
const InstallCreator_1 = require("./installs/InstallCreator");
const InstallList_1 = require("./installs/InstallList");
const Logger_1 = require("./utilities/Logger");
const process_1 = require("process");
const Language = require("./i18n/i18n");
const ModInstaller_1 = require("./installs/ModInstaller");
const ModNormaliser_1 = require("./mods/ModNormaliser");
const SDKServer_1 = require("./sdk/SDKServer");
const DISCORD_APPID = "453299645725016074";
const SUPPORTED_PLATFORMS = [
    "linux", "win32",
];
const DDLC_HASHES = ["2a3dd7969a06729a32ace0a6ece5f2327e29bdf460b8b39e6a8b0875e545632e"];
let appWin;
let richPresence;
let sdkServer;
let i18n = Language("en-GB");
let debug = false;
let crashed = false;
let allowClosing = false;
const downloads = new Map();
richPresence = new RichPresence_1.default(DISCORD_APPID);
richPresence.setIdlePresence();
electron_updater_1.autoUpdater.autoDownload = true;
electron_updater_1.autoUpdater.logger = Logger_1.default;
electron_updater_1.autoUpdater.on("update-downloaded", () => {
    appWin.webContents.send("update downloaded");
});
function downloadBaseGame() {
    DownloadLinkRetriever_1.default.getDownloadLink().then((link) => {
        appWin.webContents.downloadURL(link);
    }).catch((e) => {
        console.log(e);
    });
}
function launchGame(dir) {
    let installData;
    appWin.minimize();
    try {
        installData =
            JSON.parse(fs_1.readFileSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", dir, "install.json")).toString("utf8"));
    }
    catch (e) {
        appWin.webContents.send("running cover", false);
        appWin.webContents.send("show toast", i18n("install_launch.toast_corrupt"));
        return;
    }
    const gameExecutable = path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", dir, "install", (process.platform === "win32" ? "ddlc.exe" : "DDLC.sh"));
    appWin.webContents.send("running cover", true);
    const dataFolder = path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", dir, "appdata");
    // If the app uses the global save, don't change the environment variables
    const env = installData.globalSave ? process.env : Object.assign(process.env, {
        APPDATA: dataFolder,
        HOME: dataFolder,
    });
    const procHandle = child_process_1.spawn(gameExecutable, [], {
        // Overwrite the environment variables to force Ren'Py to save where we want it to.
        // On Windows, the save location is determined by the value of %appdata% but on macOS / Linux
        // it saves based on the home directory location. This can be changed with $HOME but means the save
        // files cannot be directly ported between operating systems.
        cwd: path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", dir, "install"),
        env,
    });
    richPresence.setPlayingPresence(installData.name);
    sdkServer.setPlaying(dir);
    procHandle.on("error", (error) => {
        sdkServer.setPlaying(null);
        appWin.webContents.send("running cover", false);
        appWin.webContents.send("show toast", i18n("install_launch.toast_launch_error"));
        appWin.restore();
    });
    procHandle.on("close", () => {
        sdkServer.setPlaying(null);
        richPresence.setIdlePresence();
        appWin.webContents.send("running cover", false);
        appWin.webContents.send("install list", InstallList_1.default.getInstallList());
        appWin.restore();
    });
}
function checkUpdates() {
    if (!isDev) {
        electron_updater_1.autoUpdater.checkForUpdatesAndNotify().then((update) => {
            if (update) {
                appWin.webContents.send("update info", {
                    success: true,
                    update,
                });
            }
            else {
                appWin.webContents.send("update info", {
                    success: true,
                    update: null,
                });
            }
        }).catch((e) => {
            Logger_1.default.warn("Error checking for updates");
            appWin.webContents.send("update info", {
                reason: i18n("update_error.offline"),
                success: false,
            });
        });
    }
    else {
        Logger_1.default.warn("Not checking for updates in a dev environment");
        appWin.webContents.send("update info", {
            reason: i18n("update_error.devmode"),
            success: false,
        });
    }
}
function readMods() {
    appWin.webContents.send("mod list", fs_1.readdirSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "mods")));
}
process_1.on("uncaughtException", (error) => {
    console.error(error);
    if (crashed) {
        return;
    }
    crashed = true;
    if (appWin) {
        appWin.hide();
    }
    Logger_1.default.error("An uncaught exception occurred!");
    Logger_1.default.error("Preparing to upload stacktrace...");
    let paste = "Doki Doki Mod Manager! Crash Report\n\n";
    paste += "Timestamp: " + new Date().toISOString() + "\n";
    paste += "Version: " + electron_1.app.getVersion() + "\n";
    paste += "Platform: " + process.platform + "\n";
    paste += "Arch: " + process.arch + "\n";
    paste += "Node Version: " + process.version + "\n";
    paste += "Args: " + process.argv.join(" ") + "\n";
    paste += "Debug Tools: " + (debug ? "Yes" : "No") + "\n";
    paste += "\nSTACKTRACE:\n\n";
    paste += error.stack;
    paste += "\n\nCONFIG FILE:\n\n";
    try {
        paste += fs_1.readFileSync(path_1.join(electron_1.app.getPath("userData"), "config.json")).toString("utf8");
    }
    catch (e) {
        paste += "Error reading - " + e.message;
    }
    electron_1.dialog.showMessageBox({
        buttons: [i18n("crash_reporter.button_view_crash"), i18n("crash_reporter.button_quit")],
        defaultId: 1,
        detail: i18n("crash_reporter.dialog_message"),
        message: i18n("crash_reporter.dialog_title"),
        type: "error",
    }, (btn) => {
        request({
            headers: {
                "User-Agent": "Doki Doki Mod Manager (u/zuudo)",
            },
            json: {
                crash: paste,
            },
            method: "POST",
            url: "https://us-central1-doki-doki-mod-manager.cloudfunctions.net/postCrashReport",
        }, (e, r, b) => {
            if (!e) {
                if (btn === 0) {
                    electron_1.shell.openExternal("https://gist.githubusercontent.com/ZudoMC/" + b + "/raw/crash.txt");
                }
            }
            electron_1.app.exit();
        });
    });
});
DirectoryManager_1.default.createDirs(Config_1.default.readConfigValue("installFolder"));
electron_1.app.on("ready", () => {
    i18n = Language(electron_1.app.getLocale());
    if (electron_1.app.makeSingleInstance((argv) => {
        appWin.restore();
        appWin.focus();
    })) {
        Logger_1.default.info("Signalled other instance - quitting.");
        electron_1.app.quit();
        return;
    }
    try {
        fs_1.writeFileSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "av-test.txt"), "This is a test file for DDMM and can be safely deleted.");
    }
    catch (e) {
        electron_1.dialog.showMessageBox({
            detail: i18n("av_checker.dialog_message", e.toString()),
            message: i18n("av_checker.dialog_title"),
            type: "warning",
        });
    }
    electron_1.app.setAppUserModelId("space.doki.modmanager");
    if (SUPPORTED_PLATFORMS.indexOf(process.platform) === -1) {
        electron_1.dialog.showMessageBox({
            detail: i18n("platform_test.dialog_message"),
            message: i18n("platform_test.dialog_title"),
            type: "warning",
        });
    }
    if (isDev) {
        require("devtron").install();
    }
    Logger_1.default.info("Creating app window...");
    // Instantiate the main app window
    appWin = new electron_1.BrowserWindow({
        height: 700,
        show: false,
        webPreferences: {
            textAreasAreResizable: false,
        },
        width: 1000,
    });
    // Load the app UI
    appWin.loadFile(path_1.join(__dirname, "../gui/html/index.html"));
    // ...and show it when ready
    appWin.on("ready-to-show", () => {
        appWin.show();
        Logger_1.default.info("App window visible.");
    });
    // dereference closed windows
    appWin.on("closed", () => {
        appWin = null;
    });
    // prevent accidental closes
    appWin.on("close", (e) => {
        if (!allowClosing && downloads.size !== 0) {
            e.preventDefault();
            electron_1.dialog.showMessageBox({
                buttons: ["Quit Anyway", "Cancel"],
                defaultId: 1,
                detail: i18n("download_warning.dialog_message"),
                message: i18n("download_warning.dialog_title"),
            }, (button) => {
                if (button === 0) {
                    allowClosing = true;
                    appWin.close();
                }
            });
        }
    });
    electron_1.app.on("window-all-closed", () => {
        Logger_1.default.debug("Window all closed");
        electron_1.app.quit();
    });
    // page event handlers
    appWin.webContents.on("did-finish-load", () => {
        appWin.webContents.send("install list", InstallList_1.default.getInstallList());
        checkUpdates();
        readMods();
        if (debug || isDev) {
            appWin.webContents.executeJavaScript(`vueApp.ui.debug_features = true`);
        }
        // onboarding screen etc
        if (fs_1.existsSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "ddlc.zip"))) {
            const hash = sha_1.getSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "ddlc.zip"), { algorithm: "sha256" });
            if (DDLC_HASHES.indexOf(hash) !== -1) {
                appWin.webContents.send("show onboarding", false);
            }
            else {
                fs_1.unlinkSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "ddlc.zip"));
            }
        }
        appWin.webContents.send("set theme", Config_1.default.readConfigValue("theme")); // Defaults to light theme
        setTimeout(() => {
            appWin.webContents.send("ready");
        }, 500); // Avoid showing onboarding when not needed
        let toLaunch = process.argv.pop();
        if ([".", ".."].indexOf(toLaunch) === -1 && fs_1.existsSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", toLaunch))) {
            launchGame(toLaunch);
        }
    });
    // IPC functions
    electron_1.ipcMain.on("open devtools", () => {
        appWin.webContents.openDevTools({
            mode: "bottom",
        });
    });
    electron_1.ipcMain.on("enable debug", () => {
        if (debug || isDev) {
            appWin.webContents.send("show toast", i18n("debug.toast_already_enabled"));
        }
        else {
            debug = true;
            appWin.webContents.executeJavaScript(`vueApp.ui.debug_features = true`);
            appWin.webContents.send("show toast", i18n("debug.toast_enabled"));
            Logger_1.default.info("Development mode enabled.");
        }
    });
    electron_1.ipcMain.on("debug crash", () => {
        throw new Error("User caused debug crash.");
    });
    electron_1.ipcMain.on("check update", () => {
        checkUpdates();
    });
    electron_1.ipcMain.on("install update", () => {
        electron_updater_1.autoUpdater.quitAndInstall(false, true);
    });
    // Download manager functions / IPC
    electron_1.ipcMain.on("download game", () => {
        downloadBaseGame();
    });
    electron_1.session.defaultSession.on("will-download", (e, item) => {
        const file = item.getFilename();
        const url = item.getURL();
        appWin.webContents.send("show toast", "Downloading " + file);
        if (file.match(/^ddlc-(mac|win)\.zip$/)) {
            item.setSavePath(path_1.join(Config_1.default.readConfigValue("installFolder"), "ddlc.zip"));
        }
        else {
            item.setSavePath(path_1.join(Config_1.default.readConfigValue("installFolder"), "mods", file));
        }
        const id = crypto_1.randomBytes(32).toString("hex");
        downloads.set(id, item);
        item.on("updated", (_, state) => {
            if (downloads.size === 1) {
                appWin.webContents.send("download progress", {
                    downloading: true,
                    filename: item.getFilename(),
                    has_download_completed: false,
                    received_bytes: item.getReceivedBytes(),
                    total_bytes: item.getTotalBytes(),
                });
            }
            else {
                appWin.webContents.send("download progress", {
                    downloading: true,
                    filename: i18n("downloads.name_multiple", downloads.size),
                    has_download_completed: false,
                    received_bytes: Array.from(downloads.values()).reduce((a, b) => a + b.getReceivedBytes(), 0),
                    total_bytes: Array.from(downloads.values()).reduce((a, b) => a + b.getTotalBytes(), 0),
                });
            }
        });
        item.once("done", (_, state) => {
            downloads.delete(id);
            readMods();
            appWin.webContents.send("show toast", i18n("downloads.toast_complete", item.getFilename()));
            appWin.webContents.send("download progress", {
                downloading: false,
                has_download_completed: true,
                received_bytes: 0,
                total_bytes: 1,
            });
        });
    });
    // Game launch functions / IPC
    electron_1.ipcMain.on("launch install", (_, dir) => {
        launchGame(dir);
    });
    // Install management functions / IPC
    electron_1.ipcMain.on("create install", (_, meta) => {
        if (fs_1.existsSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", meta.folderName))) {
            appWin.webContents.send("show toast", i18n("install_creation.toast_folder_exists", meta.folderName));
            return;
        }
        appWin.webContents.send("loading modal", {
            display: true,
            message: i18n("install_creation.modal_message"),
            title: i18n("install_creation.modal_title"),
        });
        InstallCreator_1.default.createInstall(normaliseName(meta.folderName), meta.installName, meta.globalSave).then(() => {
            if (meta.modZip) {
                Logger_1.default.info("Installing mod!");
                ModInstaller_1.default.installMod(path_1.join(Config_1.default.readConfigValue("installFolder"), "mods", meta.modZip), path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", normaliseName(meta.folderName), "install")).then(() => {
                    appWin.webContents.send("install list", InstallList_1.default.getInstallList());
                    appWin.webContents.send("loading modal", {
                        display: false,
                    });
                }).catch((err) => {
                    appWin.webContents.send("install list", InstallList_1.default.getInstallList());
                    appWin.webContents.send("show toast", i18n("install_creation.toast_zip_error"));
                    appWin.webContents.send("loading modal", {
                        display: false,
                    });
                });
            }
            else {
                appWin.webContents.send("install list", InstallList_1.default.getInstallList());
                appWin.webContents.send("loading modal", {
                    display: false,
                });
            }
        });
    });
    electron_1.ipcMain.on("delete firstrun", (_, dir) => {
        const firstrunPath = path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", dir, "install", "game", "firstrun");
        if (fs_1.existsSync(firstrunPath)) {
            fs_1.unlink(firstrunPath, (err) => {
                if (!err) {
                    appWin.webContents.send("show toast", i18n("firstrun_delete.toast_success"));
                }
                else {
                    appWin.webContents.send("show toast", i18n("firstrun_delete.toast_error"));
                }
            });
        }
        else {
            appWin.webContents.send("show toast", i18n("firstrun_delete.toast_nonexistent"));
        }
    });
    electron_1.ipcMain.on("delete save", (_, dir) => {
        const savePath = path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", dir, "appdata");
        fs_extra_1.remove(savePath, (err) => {
            if (!err) {
                fs_1.mkdirSync(savePath);
                appWin.webContents.send("show toast", i18n("save_delete.toast_success"));
            }
            else {
                appWin.webContents.send("show toast", i18n("save_delete.toast_error"));
            }
        });
    });
    electron_1.ipcMain.on("delete install", (_, dir) => {
        appWin.webContents.send("loading modal", {
            display: true,
            message: i18n("install_delete.modal_message"),
            title: i18n("install_delete.modal_title"),
        });
        const installPath = path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", dir);
        fs_extra_1.remove(installPath, (err) => {
            appWin.webContents.send("loading modal", {
                display: false,
            });
            if (!err) {
                appWin.webContents.send("show toast", i18n("install_delete.toast_success"));
            }
            else {
                appWin.webContents.send("show toast", i18n("install_delete.toast_error"));
            }
            appWin.webContents.send("install list", InstallList_1.default.getInstallList());
        });
    });
    electron_1.ipcMain.on("delete mod", (_, mod) => {
        fs_1.unlink(path_1.join(Config_1.default.readConfigValue("installFolder"), "mods", mod), (err) => {
            if (err) {
                appWin.webContents.send("show toast", i18n("mod_delete.toast_error"));
            }
            else {
                appWin.webContents.send("show toast", i18n("mod_delete.toast_success", mod));
            }
            readMods();
        });
    });
    // Importing the game and mods
    electron_1.ipcMain.on("import game", () => {
        electron_1.dialog.showOpenDialog(appWin, {
            buttonLabel: i18n("game_import.button_import"),
            filters: [
                {
                    extensions: ["zip"],
                    name: i18n("game_import.description_game"),
                },
            ],
            title: i18n("game_import.title"),
        }, (files) => {
            if (files && files[0]) {
                const hash = sha_1.getSync(files[0], { algorithm: "sha256" });
                if (DDLC_HASHES.indexOf(hash) !== -1) {
                    fs_1.copyFileSync(files[0], path_1.join(Config_1.default.readConfigValue("installFolder"), "ddlc.zip"));
                    appWin.webContents.send("show onboarding", false);
                }
                else {
                    appWin.webContents.send("show toast", i18n("game_import.toast_error"));
                }
            }
        });
    });
    electron_1.ipcMain.on("import mod", () => {
        electron_1.dialog.showOpenDialog(appWin, {
            buttonLabel: i18n("mod_import.button_import"),
            filters: [
                {
                    extensions: ["zip"],
                    name: i18n("mod_import.description_mod"),
                },
            ],
            title: i18n("mod_import.title"),
        }, (files) => {
            if (files && files[0]) {
                const filename = files[0].split(path_1.sep).pop();
                fs_1.copyFileSync(files[0], path_1.join(Config_1.default.readConfigValue("installFolder"), "mods", filename));
                appWin.webContents.send("show toast", i18n("mod_import.toast_success", filename));
                readMods();
            }
        });
    });
    electron_1.ipcMain.on("import mod dropped", (_, mod) => {
        const filename = mod.split(path_1.sep).pop();
        fs_1.copyFileSync(mod, path_1.join(Config_1.default.readConfigValue("installFolder"), "mods", filename));
        appWin.webContents.send("show toast", i18n("mod_import.toast_success", filename));
        readMods();
    });
    electron_1.ipcMain.on("save theme", (_, theme) => {
        Config_1.default.saveConfigValue("theme", theme);
    });
    // Inference debug
    electron_1.ipcMain.on("test inference", (_, mod) => {
        ModNormaliser_1.inferMapper(path_1.join(Config_1.default.readConfigValue("installFolder"), "mods", mod)).then((mapper) => {
            appWin.webContents.send("inference result", {
                delete: mapper.getFilesToDelete(),
                mapper: mapper.getFriendlyName(),
                mod,
            });
        });
    });
    electron_1.ipcMain.on("submit feedback", (_, feedback) => {
        request({
            headers: {
                "User-Agent": "Doki Doki Mod Manager (u/zuudo)",
            },
            json: {
                body: feedback.body,
                contact: feedback.contact,
                type: feedback.type,
            },
            method: "POST",
            url: "https://us-central1-doki-doki-mod-manager.cloudfunctions.net/sendFeedback",
        }, () => {
            appWin.webContents.send("show toast", i18n("feedback.toast_sent"));
        });
    });
    sdkServer = new SDKServer_1.default(41420, "127.0.0.1");
});
//# sourceMappingURL=main.js.map