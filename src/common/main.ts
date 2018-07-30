import {spawn} from "child_process";
import {app, BrowserWindow, dialog, ipcMain, session, shell} from "electron";
import * as isDev from "electron-is-dev";
import {autoUpdater} from "electron-updater";
import {copyFileSync, existsSync as fileExists, mkdirSync, readdirSync, readFileSync, unlink, unlinkSync} from "fs";
import {remove} from "fs-extra";
import {join as joinPath, sep as pathSep} from "path";
import * as request from "request";
import * as normaliseName from "sanitize-filename";
import {getSync as hashSync} from "sha";
import RichPresence from "./discord/RichPresence";
import DownloadLinkRetriever from "./download/DownloadLinkRetriever";
import {DownloadManager, DownloadStatus} from "./download/DownloadManager";
import Config from "./files/Config";
import DirectoryManager from "./files/DirectoryManager";
import InstallCreator from "./installs/InstallCreator";
import InstallList from "./installs/InstallList";
import Logger from "./utilities/Logger";

import {on as registerProcessEventHandler} from "process";
import ModInstaller from "./installs/ModInstaller";
import {inferMapper} from "./mods/ModNormaliser";

const PROTOCOL: string = "ddmm";
const DISCORD_APPID: string = "453299645725016074";
const SUPPORTED_PLATFORMS: string[] = [
    "linux", "win32",
];

const DDLC_HASHES = ["2a3dd7969a06729a32ace0a6ece5f2327e29bdf460b8b39e6a8b0875e545632e"];

let appWin: BrowserWindow;

let richPresence: RichPresence;
let downloadManager: DownloadManager;

let debug: boolean = false;

let crashed: boolean = false;

let allowClosing: boolean = false;

let moniIndex: number = 0;

downloadManager = new DownloadManager();

richPresence = new RichPresence(DISCORD_APPID);
richPresence.setIdlePresence();

autoUpdater.autoDownload = true;
autoUpdater.logger = Logger;

autoUpdater.on("update-downloaded", () => {
    appWin.webContents.send("update downloaded");
});

function handleURL(args: string[]) {
    const handledURL: string = args.pop();

    if (handledURL.startsWith(PROTOCOL + ":")) {
        const downloadURL: string = handledURL.substring(PROTOCOL.length + 1);
        // cheat and download the URL. I'm sorry, but it lets me trigger some of the nice download behaviour.
        appWin.webContents.downloadURL(downloadURL);
    }
}

function downloadBaseGame() {
    DownloadLinkRetriever.getDownloadLink().then((link: string) => {
        downloadManager.queueDownload(link,
            joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"), "Doki Doki Literature Club - Game Files");
    }).catch((e) => {
        console.log(e);
    });
}

function checkUpdates() {
    if (!isDev) {
        autoUpdater.checkForUpdatesAndNotify().then((update) => {
            if (update) {
                appWin.webContents.send("update info", {
                    success: true,
                    update,
                });
            } else {
                appWin.webContents.send("update info", {
                    success: true,
                    update: null,
                });
            }
        }).catch((e) => {
            Logger.warn("Error checking for updates");
            appWin.webContents.send("update info", {
                reason: "We can't check for updates right now. Please check your internet connection and try again.",
                success: false,
            });
        });
    } else {
        Logger.warn("Not checking for updates in a dev environment");
        appWin.webContents.send("update info", {
            reason: "Update checks cannot be performed when Doki Doki Mod Manager is being run in development mode. " +
                "You can pull the latest changes from Git instead.",
            success: false,
        });
    }
}

function readMods() {
    appWin.webContents.send("mod list", readdirSync(joinPath(Config.readConfigValue("installFolder"), "mods")));
}

registerProcessEventHandler("uncaughtException", (error) => {
    console.error(error);

    if (crashed) {
        return;
    }
    crashed = true;
    if (appWin) {
        appWin.hide();
    }


    dialog.showMessageBox({
        buttons: ["Restart", "Quit"],
        defaultId: 1,
        detail: "A problem occurred in Doki Doki Mod Manager which caused the app to crash. " +
            "A crash report has been generated, which will be helpful when fixing the issue.",
        message: "Doki Doki Mod Manager crashed!",
        type: "error",
    }, (btn) => {
        if (btn === 0) {
            app.relaunch();
        }
    });

    Logger.error("An uncaught exception occurred!");
    Logger.error("Preparing to upload stacktrace...");

    let paste: string = "Doki Doki Mod Manager! Crash Report\n\n";
    paste += "Timestamp: " + new Date().toISOString() + "\n";
    paste += "Version: " + app.getVersion() + "\n";
    paste += "Platform: " + process.platform + "\n";
    paste += "Arch: " + process.arch + "\n";
    paste += "Node Version: " + process.version + "\n";
    paste += "Args: " + process.argv.join(" ") + "\n";
    paste += "Debug Tools: " + (debug ? "Yes" : "No") + "\n";
    paste += "\nSTACKTRACE:\n\n";
    paste += error.stack;
    paste += "\n\nCONFIG FILE:\n\n";
    try {
        paste += readFileSync(joinPath(app.getPath("userData"), "config.json")).toString("utf8");
    } catch (e) {
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

DirectoryManager.createDirs(Config.readConfigValue("installFolder"));

app.on("ready", () => {
    if (app.makeSingleInstance((argv: string[]) => {
        appWin.restore();
        appWin.focus();
        handleURL(argv);
    })) {
        Logger.info("Signalled other instance - quitting.");
        app.quit();
        return;
    }

    app.setAsDefaultProtocolClient(PROTOCOL);

    if (SUPPORTED_PLATFORMS.indexOf(process.platform) === -1) {
        dialog.showMessageBox({
            detail: "Doki Doki Mod Manager is only supported on Windows and Linux. " +
                "We'll try launching anyway, but please don't send any bug reports to me as they will be ignored.",
            message: "Your operating system is not supported.",
            type: "warning",
        });
    }

    if (isDev) {
        require("devtron").install();
    }

    Logger.info("Creating app window...");

    // Instantiate the main app window
    appWin = new BrowserWindow({
        height: 700,
        show: false,
        width: 1000,
    });

    // Load the app UI
    appWin.loadURL("file:///" + joinPath(__dirname, "../gui/html/app/index.html"));

    // ...and show it when ready
    appWin.on("ready-to-show", () => {
        appWin.show();
        Logger.info("App window visible.");
    });

    // dereference closed windows
    appWin.on("closed", () => {
        appWin = null;
    });

    // prevent accidental closes
    appWin.on("close", (e) => {
        if (!allowClosing &&
            downloadManager.getQueue().filter((dl) => dl.status === DownloadStatus.DOWNLOADING).length > 0) {
            e.preventDefault();
            dialog.showMessageBox({
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

    app.on("window-all-closed", () => {
        Logger.debug("Window all closed");
        app.quit();
    });

    // page event handlers
    appWin.webContents.on("did-finish-load", () => {
        appWin.webContents.send("install list", InstallList.getInstallList());
        checkUpdates();
        readMods();
        if (debug) {
            appWin.webContents.executeJavaScript(`vueApp.ui.debug_features = true`);
        }
        // onboarding screen etc
        if (fileExists(joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"))) {
            const hash = hashSync(joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"), {algorithm: "sha256"});
            if (DDLC_HASHES.indexOf(hash) !== -1) {
                appWin.webContents.send("show onboarding", false);
            } else {
                unlinkSync(joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"));
            }
        }
        appWin.webContents.send("set theme", Config.readConfigValue("theme")); // Defaults to light theme
        setTimeout(() => {
            appWin.webContents.send("ready");
        }, 500); // Avoid showing onboarding when not needed
    });

    // IPC functions

    ipcMain.on("open devtools", () => {
        appWin.webContents.openDevTools({
            mode: "bottom",
        });
    });

    ipcMain.on("enable debug", () => {
        moniIndex += 1;
        if (debug) {
            if (moniIndex === 3) {
                appWin.webContents.send("show monika");
            } else if (moniIndex === 2) {
                appWin.webContents.send("show toast",
                    "Please stop playing with my heart. I don't want to come back.");
            } else {
                appWin.webContents.send("show toast",
                    "There's nothing else to see here.");
            }
        } else {
            debug = true;
            appWin.webContents.executeJavaScript(`vueApp.ui.debug_features = true`);
            appWin.webContents.send("show toast",
                "Debugging features enabled. Do not send me bug reports unless" +
                " you can reproduce your issue without them turned on.");
            Logger.info("Development mode enabled.");
        }
    });

    ipcMain.on("debug crash", () => {
        throw new Error("User caused debug crash.");
    });

    ipcMain.on("check update", () => {
        checkUpdates();
    });

    ipcMain.on("install update", () => {
        autoUpdater.quitAndInstall(false, true);
    });

    // Download manager functions / IPC

    setInterval(() => {
        if (appWin) {
            appWin.webContents.send("download queue", downloadManager.getQueue());
        }
    }, 100);

    ipcMain.on("remove download", (_, id) => {
        downloadManager.removeDownload(id);
    });

    ipcMain.on("download game", () => {
        downloadBaseGame();
    });

    session.defaultSession.on("will-download", (e, i) => {
        e.preventDefault();

        const file = i.getFilename();
        const url = i.getURL();

        if (i.getMimeType() !== "application/zip" && !(file && file.endsWith(".zip"))) {
            appWin.webContents.send("show toast",
                file + " doesn't look like a mod zip file. It may require manual installation.");
        } else {
            appWin.webContents.send("show toast", "Downloading " + file);

            downloadManager.queueDownload(url, joinPath(Config.readConfigValue("installFolder"), "mods", file),
                file, file);
        }
    });

    downloadManager.on("progress", (progress) => {
        appWin.setProgressBar(progress);
    });

    downloadManager.on("download finished", () => {
        readMods();
    });

    // Game launch functions / IPC

    ipcMain.on("launch install", (_, dir) => {
        let installData;

        try {
            installData =
                JSON.parse(readFileSync(joinPath(Config.readConfigValue("installFolder"),
                    "installs", dir, "install.json")).toString("utf8"));
        } catch (e) {
            appWin.webContents.send("running cover", false);
            appWin.webContents.send("show toast",
                "The game installation appears to be corrupted. Please uninstall it and create a new one.");
            return;
        }

        const gameExecutable = joinPath(Config.readConfigValue("installFolder"),
            "installs",
            dir,
            "install",
            (process.platform === "win32" ? "ddlc.exe" : "DDLC.sh"));

        appWin.webContents.send("running cover", true);

        const dataFolder = joinPath(Config.readConfigValue("installFolder"),
            "installs",
            dir,
            "appdata");

        // If the app uses the global save, don't change the environment variables
        const env = installData.globalSave ? process.env : Object.assign(process.env, {
            APPDATA: dataFolder, // Windows
            HOME: dataFolder, // macOS and Linux
        });

        const procHandle = spawn(gameExecutable, [], {
            // Overwrite the environment variables to force Ren'Py to save where we want it to.
            // On Windows, the save location is determined by the value of %appdata% but on macOS / Linux
            // it saves based on the home directory location. This can be changed with $HOME but means the save
            // files cannot be directly ported between operating systems.
            cwd: joinPath(Config.readConfigValue("installFolder"),
                "installs",
                dir,
                "install"),
            env,
        });

        let crashFlag: boolean = false;

        richPresence.setPlayingPresence(installData.name);

        procHandle.stderr.on("data", (d) => {
            Logger.debug("stderr: " + d);
        });

        procHandle.stdout.on("data", (d) => {
            Logger.debug("stdout: " + d);

            // detect monika's fake crash and warnings
            if (!(d.toString().indexOf("Oh jeez") !== -1 || d.toString().indexOf("Warning") !== -1)) {
                crashFlag = true;
            }
        });

        procHandle.on("error", (error) => {
            appWin.webContents.send("running cover", false);
            appWin.webContents.send("show toast",
                "The game failed to launch..<br>" + error.message);
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

    ipcMain.on("create install", (_, meta) => {
        if (fileExists(joinPath(Config.readConfigValue("installFolder"), "installs", meta.folderName))) {
            appWin.webContents.send("show toast",
                "The folder " + meta.folderName + " already exists. Try a different name.");
            return;
        }
        appWin.webContents.send("loading modal", {
            display: true,
            message: "Please wait while the game installs. This may take up to a minute.",
            title: "Installing Game",
        });
        InstallCreator.createInstall(normaliseName(meta.folderName), meta.installName, meta.globalSave).then(() => {
            if (meta.modZip) {
                Logger.info("Installing mod!");
                ModInstaller.installMod(
                    joinPath(Config.readConfigValue("installFolder"), "mods", meta.modZip),
                    joinPath(Config.readConfigValue("installFolder"), "installs", normaliseName(meta.folderName),
                        "install"),
                ).then(() => {
                    appWin.webContents.send("install list", InstallList.getInstallList());
                    appWin.webContents.send("loading modal", {
                        display: false,
                    });
                }).catch((err) => {
                    appWin.webContents.send("install list", InstallList.getInstallList());
                    appWin.webContents.send("show toast",
                        "Failed to install mod - try downloading it again.<br>" + err.message);
                    appWin.webContents.send("loading modal", {
                        display: false,
                    });
                });
            } else {
                appWin.webContents.send("install list", InstallList.getInstallList());
                appWin.webContents.send("loading modal", {
                    display: false,
                });
            }
        });
    });

    ipcMain.on("delete firstrun", (_, dir) => {
        const firstrunPath =
            joinPath(Config.readConfigValue("installFolder"), "installs", dir, "install", "game", "firstrun");
        if (fileExists(firstrunPath)) {
            unlink(firstrunPath, (err) => {
                if (!err) {
                    appWin.webContents.send("show toast", "Deleted firstrun flag.");
                } else {
                    appWin.webContents.send("show toast", "Failed to delete firstrun flag.<br>" + err.message);
                }
            });
        } else {
            appWin.webContents.send("show toast", "Firstrun flag does not exist.");
        }
    });

    ipcMain.on("delete save", (_, dir) => {
        const savePath =
            joinPath(Config.readConfigValue("installFolder"), "installs", dir, "appdata");
        remove(savePath, (err) => {
            if (!err) {
                mkdirSync(savePath);
                appWin.webContents.send("show toast", "Deleted save data.");
            } else {
                appWin.webContents.send("show toast", "Failed to delete save data.<br>" + err.message);
            }
        });
    });

    ipcMain.on("delete install", (_, dir) => {
        appWin.webContents.send("loading modal", {
            display: true,
            message: "Please wait while the game is removed.",
            title: "Uninstalling Game",
        });
        const installPath =
            joinPath(Config.readConfigValue("installFolder"), "installs", dir);
        remove(installPath, (err) => {
            appWin.webContents.send("loading modal", {
                display: false,
            });
            if (!err) {
                appWin.webContents.send("show toast", "Uninstalled.");
            } else {
                appWin.webContents.send("show toast", "Failed to uninstall.<br>" + err.message);
            }
            appWin.webContents.send("install list", InstallList.getInstallList());
        });
    });

    ipcMain.on("delete mod", (_, mod) => {
        unlink(joinPath(Config.readConfigValue("installFolder"), "mods", mod), (err) => {
            if (err) {
                appWin.webContents.send("show toast", "Failed to delete mod.<br>" + err.message);
            } else {
                appWin.webContents.send("show toast", "Deleted " + mod);
            }
            readMods();
        });
    });

    // Importing the game and mods
    ipcMain.on("import game", () => {
        dialog.showOpenDialog(appWin, {
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
                const hash = hashSync(files[0], {algorithm: "sha256"});
                if (DDLC_HASHES.indexOf(hash) !== -1) {
                    copyFileSync(files[0], joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"));
                    appWin.webContents.send("show onboarding", false);
                } else {
                    appWin.webContents.send("show toast",
                        "That doesn't look like a copy of DDLC. Make sure you are installing version 1.1.1");
                }
            }
        });
    });

    ipcMain.on("import mod", () => {
        dialog.showOpenDialog(appWin, {
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
                const filename = files[0].split(pathSep).pop();

                copyFileSync(files[0], joinPath(Config.readConfigValue("installFolder"), "mods", filename));
                appWin.webContents.send("show toast", "Imported " + filename + " into the mod library.");
                readMods();
            }
        });
    });

    ipcMain.on("cancel download", (_, id) => {
        downloadManager.removeDownload(id);
    });

    ipcMain.on("save theme", (_, theme) => {
        Config.saveConfigValue("theme", theme);
    });

    // Inference debug
    ipcMain.on("test inference", (_, mod) => {
        inferMapper(joinPath(Config.readConfigValue("installFolder"), "mods", mod)).then((mapper) => {
            appWin.webContents.send("inference result", {
                delete: mapper.getFilesToDelete(),
                mapper: mapper.getFriendlyName(),
                mod,
            });
        });
    });

    handleURL(process.argv);
});
