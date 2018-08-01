"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
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
const DownloadManager_1 = require("./download/DownloadManager");
const Config_1 = require("./files/Config");
const DirectoryManager_1 = require("./files/DirectoryManager");
const InstallCreator_1 = require("./installs/InstallCreator");
const InstallList_1 = require("./installs/InstallList");
const Logger_1 = require("./utilities/Logger");
const process_1 = require("process");
const ModInstaller_1 = require("./installs/ModInstaller");
const ModNormaliser_1 = require("./mods/ModNormaliser");
const PROTOCOL = "ddmm";
const DISCORD_APPID = "453299645725016074";
const SUPPORTED_PLATFORMS = [
    "linux", "win32",
];
const DDLC_HASHES = ["2a3dd7969a06729a32ace0a6ece5f2327e29bdf460b8b39e6a8b0875e545632e"];
let appWin;
let richPresence;
let downloadManager;
let debug = false;
let crashed = false;
let allowClosing = false;
let moniIndex = 0;
downloadManager = new DownloadManager_1.DownloadManager();
richPresence = new RichPresence_1.default(DISCORD_APPID);
richPresence.setIdlePresence();
electron_updater_1.autoUpdater.autoDownload = true;
electron_updater_1.autoUpdater.logger = Logger_1.default;
electron_updater_1.autoUpdater.on("update-downloaded", () => {
    appWin.webContents.send("update downloaded");
});
function handleURL(args) {
    const handledURL = args.pop();
    if (handledURL.startsWith(PROTOCOL + ":")) {
        const downloadURL = handledURL.substring(PROTOCOL.length + 1);
        // cheat and download the URL. I'm sorry, but it lets me trigger some of the nice download behaviour.
        appWin.webContents.downloadURL(downloadURL);
    }
}
function downloadBaseGame() {
    DownloadLinkRetriever_1.default.getDownloadLink().then((link) => {
        downloadManager.queueDownload(link, path_1.join(Config_1.default.readConfigValue("installFolder"), "ddlc.zip"), "Doki Doki Literature Club - Game Files");
    }).catch((e) => {
        console.log(e);
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
                reason: "We can't check for updates right now. Please check your internet connection and try again.",
                success: false,
            });
        });
    }
    else {
        Logger_1.default.warn("Not checking for updates in a dev environment");
        appWin.webContents.send("update info", {
            reason: "Update checks cannot be performed when Doki Doki Mod Manager is being run in development mode. " +
                "You can pull the latest changes from Git instead.",
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
    electron_1.dialog.showMessageBox({
        buttons: ["Restart", "Quit"],
        defaultId: 1,
        detail: "A problem occurred in Doki Doki Mod Manager which caused the app to crash. " +
            "A crash report has been generated, which will be helpful when fixing the issue.",
        message: "Doki Doki Mod Manager crashed!",
        type: "error",
    }, (btn) => {
        if (btn === 0) {
            electron_1.app.relaunch();
        }
    });
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
    request({
        headers: {
            "User-Agent": "Doki Doki Mod Manager (u/zuudo)",
        },
        json: {
            crash: paste,
        },
        method: "POST",
        url: "https://us-central1-doki-doki-mod-manager.cloudfunctions.net/postCrashReport",
    });
});
DirectoryManager_1.default.createDirs(Config_1.default.readConfigValue("installFolder"));
electron_1.app.on("ready", () => {
    if (electron_1.app.makeSingleInstance((argv) => {
        appWin.restore();
        appWin.focus();
        handleURL(argv);
    })) {
        Logger_1.default.info("Signalled other instance - quitting.");
        electron_1.app.quit();
        return;
    }
    electron_1.app.setAsDefaultProtocolClient(PROTOCOL);
    if (SUPPORTED_PLATFORMS.indexOf(process.platform) === -1) {
        electron_1.dialog.showMessageBox({
            detail: "Doki Doki Mod Manager is only supported on Windows and Linux. " +
                "We'll try launching anyway, but please don't send any bug reports to me as they will be ignored.",
            message: "Your operating system is not supported.",
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
        width: 1000,
    });
    // Load the app UI
    appWin.loadURL("file:///" + path_1.join(__dirname, "../gui/html/index.html"));
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
        if (!allowClosing &&
            downloadManager.getQueue().filter((dl) => dl.status === DownloadManager_1.DownloadStatus.DOWNLOADING).length > 0) {
            e.preventDefault();
            electron_1.dialog.showMessageBox({
                buttons: ["Quit Anyway", "Cancel"],
                defaultId: 1,
                detail: "If you quit now, these downloads cannot be recovered.",
                message: "There are still downloads in progress",
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
        if (debug) {
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
    });
    // IPC functions
    electron_1.ipcMain.on("open devtools", () => {
        appWin.webContents.openDevTools({
            mode: "bottom",
        });
    });
    electron_1.ipcMain.on("enable debug", () => {
        moniIndex += 1;
        if (debug) {
            if (moniIndex === 3) {
                appWin.webContents.send("show monika");
            }
            else if (moniIndex === 2) {
                appWin.webContents.send("show toast", "Please stop playing with my heart. I don't want to come back.");
            }
            else {
                appWin.webContents.send("show toast", "There's nothing else to see here.");
            }
        }
        else {
            debug = true;
            appWin.webContents.executeJavaScript(`vueApp.ui.debug_features = true`);
            appWin.webContents.send("show toast", "Debugging features enabled. Do not send me bug reports unless" +
                " you can reproduce your issue without them turned on.");
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
    setInterval(() => {
        if (appWin) {
            appWin.webContents.send("download queue", downloadManager.getQueue());
        }
    }, 100);
    electron_1.ipcMain.on("remove download", (_, id) => {
        downloadManager.removeDownload(id);
    });
    electron_1.ipcMain.on("download game", () => {
        downloadBaseGame();
    });
    electron_1.session.defaultSession.on("will-download", (e, i) => {
        e.preventDefault();
        const file = i.getFilename();
        const url = i.getURL();
        if (i.getMimeType() !== "application/zip" && !(file && file.endsWith(".zip"))) {
            appWin.webContents.send("show toast", file + " doesn't look like a mod zip file. It may require manual installation.");
        }
        else {
            appWin.webContents.send("show toast", "Downloading " + file);
            downloadManager.queueDownload(url, path_1.join(Config_1.default.readConfigValue("installFolder"), "mods", file), file, file);
        }
    });
    downloadManager.on("progress", (progress) => {
        appWin.setProgressBar(progress);
    });
    downloadManager.on("download finished", () => {
        readMods();
    });
    // Game launch functions / IPC
    electron_1.ipcMain.on("launch install", (_, dir) => {
        let installData;
        try {
            installData =
                JSON.parse(fs_1.readFileSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", dir, "install.json")).toString("utf8"));
        }
        catch (e) {
            appWin.webContents.send("running cover", false);
            appWin.webContents.send("show toast", "The game installation appears to be corrupted. Please uninstall it and create a new one.");
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
        let crashFlag = false;
        richPresence.setPlayingPresence(installData.name);
        procHandle.stderr.on("data", (d) => {
            Logger_1.default.debug("stderr: " + d);
        });
        procHandle.stdout.on("data", (d) => {
            Logger_1.default.debug("stdout: " + d);
            // detect monika's fake crash and warnings
            if (!(d.toString().indexOf("Oh jeez") !== -1 || d.toString().indexOf("Warning") !== -1)) {
                crashFlag = true;
            }
        });
        procHandle.on("error", (error) => {
            appWin.webContents.send("running cover", false);
            appWin.webContents.send("show toast", "The game failed to launch..<br>" + error.message);
        });
        procHandle.on("close", (code) => {
            richPresence.setIdlePresence();
            appWin.webContents.send("running cover", false);
            if (code === 0 && crashFlag) {
                appWin.webContents.send("show toast", "The game crashed.");
            }
        });
    });
    // Install management functions / IPC
    electron_1.ipcMain.on("create install", (_, meta) => {
        if (fs_1.existsSync(path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", meta.folderName))) {
            appWin.webContents.send("show toast", "The folder " + meta.folderName + " already exists. Try a different name.");
            return;
        }
        appWin.webContents.send("loading modal", {
            display: true,
            message: "Please wait while the game installs. This may take up to a minute.",
            title: "Installing Game",
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
                    appWin.webContents.send("show toast", "Failed to install mod - try downloading it again.<br>" + err.message);
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
                    appWin.webContents.send("show toast", "Deleted firstrun flag.");
                }
                else {
                    appWin.webContents.send("show toast", "Failed to delete firstrun flag.<br>" + err.message);
                }
            });
        }
        else {
            appWin.webContents.send("show toast", "Firstrun flag does not exist.");
        }
    });
    electron_1.ipcMain.on("delete save", (_, dir) => {
        const savePath = path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", dir, "appdata");
        fs_extra_1.remove(savePath, (err) => {
            if (!err) {
                fs_1.mkdirSync(savePath);
                appWin.webContents.send("show toast", "Deleted save data.");
            }
            else {
                appWin.webContents.send("show toast", "Failed to delete save data.<br>" + err.message);
            }
        });
    });
    electron_1.ipcMain.on("delete install", (_, dir) => {
        appWin.webContents.send("loading modal", {
            display: true,
            message: "Please wait while the game is removed.",
            title: "Uninstalling Game",
        });
        const installPath = path_1.join(Config_1.default.readConfigValue("installFolder"), "installs", dir);
        fs_extra_1.remove(installPath, (err) => {
            appWin.webContents.send("loading modal", {
                display: false,
            });
            if (!err) {
                appWin.webContents.send("show toast", "Uninstalled.");
            }
            else {
                appWin.webContents.send("show toast", "Failed to uninstall.<br>" + err.message);
            }
            appWin.webContents.send("install list", InstallList_1.default.getInstallList());
        });
    });
    electron_1.ipcMain.on("delete mod", (_, mod) => {
        fs_1.unlink(path_1.join(Config_1.default.readConfigValue("installFolder"), "mods", mod), (err) => {
            if (err) {
                appWin.webContents.send("show toast", "Failed to delete mod.<br>" + err.message);
            }
            else {
                appWin.webContents.send("show toast", "Deleted " + mod);
            }
            readMods();
        });
    });
    // Importing the game and mods
    electron_1.ipcMain.on("import game", () => {
        electron_1.dialog.showOpenDialog(appWin, {
            buttonLabel: "Import",
            filters: [
                {
                    extensions: ["zip"],
                    name: "DDLC",
                },
            ],
            title: "Find a copy of DDLC v1.1.1",
        }, (files) => {
            if (files && files[0]) {
                const hash = sha_1.getSync(files[0], { algorithm: "sha256" });
                if (DDLC_HASHES.indexOf(hash) !== -1) {
                    fs_1.copyFileSync(files[0], path_1.join(Config_1.default.readConfigValue("installFolder"), "ddlc.zip"));
                    appWin.webContents.send("show onboarding", false);
                }
                else {
                    appWin.webContents.send("show toast", "That doesn't look like a copy of DDLC. Make sure you are installing version 1.1.1");
                }
            }
        });
    });
    electron_1.ipcMain.on("import mod", () => {
        electron_1.dialog.showOpenDialog(appWin, {
            buttonLabel: "Import",
            filters: [
                {
                    extensions: ["zip"],
                    name: "DDLC Mod",
                },
            ],
            title: "Find the mod you want to install.",
        }, (files) => {
            if (files && files[0]) {
                const filename = files[0].split(path_1.sep).pop();
                fs_1.copyFileSync(files[0], path_1.join(Config_1.default.readConfigValue("installFolder"), "mods", filename));
                appWin.webContents.send("show toast", "Imported " + filename + " into the mod library.");
                readMods();
            }
        });
    });
    electron_1.ipcMain.on("cancel download", (_, id) => {
        downloadManager.removeDownload(id);
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
    handleURL(process.argv);
});
//# sourceMappingURL=main.js.map