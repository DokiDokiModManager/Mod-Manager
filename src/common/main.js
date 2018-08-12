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
const ModInstaller_1 = require("./installs/ModInstaller");
const ModNormaliser_1 = require("./mods/ModNormaliser");
const SDKServer_1 = require("./sdk/SDKServer");
const PROTOCOL = "ddmm";
const DISCORD_APPID = "453299645725016074";
const SUPPORTED_PLATFORMS = [
    "linux", "win32",
];
const DDLC_HASHES = ["2a3dd7969a06729a32ace0a6ece5f2327e29bdf460b8b39e6a8b0875e545632e"];
let appWin;
let richPresence;
let sdkServer;
let debug = false;
let crashed = false;
let allowClosing = false;
let moniIndex = 0;
const downloads = new Map();
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
        appWin.webContents.downloadURL(link);
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
        buttons: ["View Crash Report", "Quit"],
        defaultId: 1,
        detail: "A problem occurred in Doki Doki Mod Manager which caused the app to crash. " +
            "A crash report has been generated, which will be helpful when fixing the issue.",
        message: "Doki Doki Mod Manager crashed!",
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
    if (electron_1.app.makeSingleInstance((argv) => {
        appWin.restore();
        appWin.focus();
        handleURL(argv);
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
            detail: "Something is interfering with Doki Doki Mod Manager and preventing it " +
                "from accessing the files it requires to run. This may lead to errors or crashes.\n\n" +
                "This may be caused by certain antivirus software - try disabling it if you continue to experience " +
                "problems.\n\n" + e.toString(),
            message: "You should check this...",
            type: "warning",
        });
    }
    electron_1.app.setAppUserModelId("space.doki.modmanager");
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
                    filename: downloads.size + " items",
                    has_download_completed: false,
                    received_bytes: Array.from(downloads.values()).reduce((a, b) => a + b.getReceivedBytes(), 0),
                    total_bytes: Array.from(downloads.values()).reduce((a, b) => a + b.getTotalBytes(), 0),
                });
            }
        });
        item.once("done", (_, state) => {
            downloads.delete(id);
            readMods();
            appWin.webContents.send("show toast", item.getFilename() + " has finished downloading.");
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
        richPresence.setPlayingPresence(installData.name);
        sdkServer.setPlaying(dir);
        procHandle.on("error", (error) => {
            sdkServer.setPlaying(null);
            appWin.webContents.send("running cover", false);
            appWin.webContents.send("show toast", "The game failed to launch.<br>" + error.message);
        });
        procHandle.on("close", () => {
            sdkServer.setPlaying(null);
            richPresence.setIdlePresence();
            appWin.webContents.send("running cover", false);
            appWin.webContents.send("install list", InstallList_1.default.getInstallList());
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
    electron_1.ipcMain.on("import mod dropped", (_, mod) => {
        const filename = mod.split(path_1.sep).pop();
        fs_1.copyFileSync(mod, path_1.join(Config_1.default.readConfigValue("installFolder"), "mods", filename));
        appWin.webContents.send("show toast", "Imported " + filename + " into the mod library.");
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
            appWin.webContents.send("show toast", "Your feedback has been sent. Thanks for the help!");
        });
    });
    sdkServer = new SDKServer_1.default(41420, "127.0.0.1");
    handleURL(process.argv);
});
//# sourceMappingURL=main.js.map