import {spawn} from "child_process";
import {randomBytes} from "crypto";
import {app, BrowserWindow, dialog, ipcMain, session, shell} from "electron";
import * as isDev from "electron-is-dev";
import {autoUpdater} from "electron-updater";
import {
    copyFileSync, existsSync,
    existsSync as fileExists,
    mkdirSync,
    readdirSync,
    readFileSync,
    unlink,
    unlinkSync,
    writeFileSync,
} from "fs";
import {remove} from "fs-extra";
import {join as joinPath, sep as pathSep} from "path";
import * as request from "request";
import * as normaliseName from "sanitize-filename";
import {getSync as hashSync} from "sha";
import RichPresence from "./discord/RichPresence";
import DownloadLinkRetriever from "./download/DownloadLinkRetriever";
import Config from "./files/Config";
import DirectoryManager from "./files/DirectoryManager";
import InstallCreator from "./installs/InstallCreator";
import InstallList from "./installs/InstallList";
import Logger from "./utilities/Logger";
// @ts-ignore ???
import * as Sentry from '@sentry/electron';

import {on as registerProcessEventHandler} from "process";
import * as Language from "./i18n/i18n";
import ModInstaller from "./installs/ModInstaller";
import {inferMapper} from "./mods/ModNormaliser";
import SDKServer from "./sdk/SDKServer";

const DISCORD_APPID: string = "453299645725016074";
const SUPPORTED_PLATFORMS: string[] = [
    "linux", "win32",
];

const DDLC_HASHES = ["2a3dd7969a06729a32ace0a6ece5f2327e29bdf460b8b39e6a8b0875e545632e"];

let appWin: BrowserWindow;

let richPresence: RichPresence;
let sdkServer: SDKServer;

let i18n = Language("en-GB");

let debug: boolean = false;

let running: boolean = false;

let crashed: boolean = false;

let allowClosing: boolean = false;

const downloads = new Map();

richPresence = new RichPresence(DISCORD_APPID);
richPresence.setIdlePresence();

autoUpdater.autoDownload = true;
autoUpdater.logger = Logger;

autoUpdater.on("update-downloaded", () => {
    appWin.webContents.send("update downloaded");
});

Sentry.init({dsn: 'https://bf0edf3f287344d4969e3171c33af4ea@sentry.io/1297252'});

function downloadBaseGame() {
    DownloadLinkRetriever.getDownloadLink().then((link: string) => {
        appWin.webContents.downloadURL(link);
    }).catch((e) => {
        console.log(e);
    });
}

function launchGame(dir) {
    if (running) return;

    running = true;

    let installData;

    appWin.minimize();

    try {
        installData =
            JSON.parse(readFileSync(joinPath(Config.readConfigValue("installFolder"),
                "installs", dir, "install.json")).toString("utf8"));
    } catch (e) {
        appWin.webContents.send("running cover", false);
        appWin.webContents.send("show toast", i18n("install_launch.toast_corrupt"));
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

    richPresence.setPlayingPresence(installData.name);
    sdkServer.setPlaying(dir);

    procHandle.on("error", (error) => {
        sdkServer.setPlaying(null);
        appWin.webContents.send("running cover", false);
        appWin.webContents.send("show toast", i18n("install_launch.toast_launch_error"));

        appWin.restore();

        running = false;
    });

    procHandle.on("close", () => {
        sdkServer.setPlaying(null);
        richPresence.setIdlePresence();
        appWin.webContents.send("running cover", false);
        appWin.webContents.send("install list", InstallList.getInstallList());
        appWin.restore();

        running = false;
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
                reason: i18n("update_error.offline"),
                success: false,
            });
        });
    } else {
        Logger.warn("Not checking for updates in a dev environment");
        appWin.webContents.send("update info", {
            reason: i18n("update_error.devmode"),
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
        buttons: [i18n("crash_reporter.button_quit")],
        detail: i18n("crash_reporter.dialog_message"),
        message: i18n("crash_reporter.dialog_title"),
        type: "error",
    }, () => {
        app.exit()
    });
});

console.log(Config.readConfigValue("installFolder", true));
console.log(Config.readConfigValue("installFolder"));
if (!Config.readConfigValue("installFolder", true) && existsSync(joinPath(app.getPath("documents"), "Doki Doki Mod Manager"))) {
    console.log("Old documents folder location");
    DirectoryManager.createDirs(Config.readConfigValue("installFolder"));
    Config.saveConfigValue("installFolder", joinPath(app.getPath("documents"), "Doki Doki Mod Manager"));
} else {
    console.log("New install location");
    DirectoryManager.createDirs(Config.readConfigValue("installFolder"));
    Config.saveConfigValue("installFolder", Config.readConfigValue("installFolder"));
}

app.on("second-instance", (_, argv) => {
    let toLaunch = argv.pop();
    if ([".", ".."].indexOf(toLaunch) === -1 && existsSync(joinPath(Config.readConfigValue("installFolder"),
        "installs", toLaunch))) {
        launchGame(toLaunch);
    } else {
        appWin.restore();
        appWin.focus();
    }
});

app.on("ready", () => {
    i18n = Language(app.getLocale());
    if (!app.requestSingleInstanceLock()) {
        Logger.info("Signalled other instance - quitting.");
        app.quit();
        return;
    }

    try {
        writeFileSync(joinPath(Config.readConfigValue("installFolder"), "av-test.txt"),
            "This is a test file for DDMM and can be safely deleted.");
    } catch (e) {
        dialog.showMessageBox({
            detail: i18n("av_checker.dialog_message", e.toString()),
            message: i18n("av_checker.dialog_title"),
            type: "warning",
        });
    }

    app.setAppUserModelId("space.doki.modmanager");

    if (SUPPORTED_PLATFORMS.indexOf(process.platform) === -1) {
        dialog.showMessageBox({
            detail: i18n("platform_test.dialog_message"),
            message: i18n("platform_test.dialog_title"),
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
        icon: joinPath(__dirname, "../../../build/icon.png"),
        show: false,
        webPreferences: {
            textAreasAreResizable: false,
        },
        width: 1000,
    });

    appWin.minimize();

    // Load the app UI
    appWin.loadFile(joinPath(__dirname, "../gui/html/index.html"));

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
        if (!allowClosing && downloads.size !== 0) {
            e.preventDefault();
            dialog.showMessageBox({
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

    app.on("window-all-closed", () => {
        Logger.debug("Window all closed");
        app.quit();
    });

    // page event handlers
    appWin.webContents.on("did-finish-load", () => {
        appWin.webContents.send("install list", InstallList.getInstallList());
        checkUpdates();
        readMods();
        if (debug || isDev) {
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
        if (debug || isDev) {
            appWin.webContents.send("show toast", i18n("debug.toast_already_enabled"));
        } else {
            debug = true;
            appWin.webContents.executeJavaScript(`vueApp.ui.debug_features = true`);
            appWin.webContents.send("show toast", i18n("debug.toast_enabled"));
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

    ipcMain.on("download game", () => {
        downloadBaseGame();
    });

    session.defaultSession.on("will-download", (e, item) => {
        const file = item.getFilename();
        const url = item.getURL();

        appWin.webContents.send("show toast", "Downloading " + file);

        if (file.match(/^ddlc-(mac|win)\.zip$/)) {
            item.setSavePath(joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"));
        } else {
            item.setSavePath(joinPath(Config.readConfigValue("installFolder"), "mods", file));
        }

        const id: string = randomBytes(32).toString("hex");

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
            } else {
                appWin.webContents.send("download progress", {
                    downloading: true,
                    filename: i18n("downloads.name_multiple", downloads.size),
                    has_download_completed: false,
                    received_bytes:
                        Array.from(downloads.values()).reduce((a, b) => a + b.getReceivedBytes(), 0),
                    total_bytes:
                        Array.from(downloads.values()).reduce((a, b) => a + b.getTotalBytes(), 0),
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

    ipcMain.on("launch install", (_, dir) => {
        launchGame(dir);
    });

    // Install management functions / IPC

    ipcMain.on("create install", (_, meta) => {
        if (fileExists(joinPath(Config.readConfigValue("installFolder"), "installs", meta.folderName))) {
            appWin.webContents.send("show toast", i18n("install_creation.toast_folder_exists", meta.folderName));
            return;
        }
        appWin.webContents.send("loading modal", {
            display: true,
            message: i18n("install_creation.modal_message"),
            title: i18n("install_creation.modal_title"),
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
                    appWin.webContents.send("show toast", i18n("install_creation.toast_zip_error"));
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
                    appWin.webContents.send("show toast", i18n("firstrun_delete.toast_success"));
                } else {
                    appWin.webContents.send("show toast", i18n("firstrun_delete.toast_error"));
                }
            });
        } else {
            appWin.webContents.send("show toast", i18n("firstrun_delete.toast_nonexistent"));
        }
    });

    ipcMain.on("delete save", (_, dir) => {
        const savePath =
            joinPath(Config.readConfigValue("installFolder"), "installs", dir, "appdata");
        remove(savePath, (err) => {
            if (!err) {
                mkdirSync(savePath);
                appWin.webContents.send("show toast", i18n("save_delete.toast_success"));
            } else {
                appWin.webContents.send("show toast", i18n("save_delete.toast_error"));
            }
        });
    });

    ipcMain.on("rename install", (_, data) => {
        console.log(data);
        const dataPath =
            joinPath(Config.readConfigValue("installFolder"), "installs", data.install, "install.json");

        let installData = JSON.parse(readFileSync(dataPath).toString("utf-8"));
        installData.name = data.name;
        writeFileSync(dataPath, JSON.stringify(installData));
    });

    ipcMain.on("delete install", (_, dir) => {
        appWin.webContents.send("loading modal", {
            display: true,
            message: i18n("install_delete.modal_message"),
            title: i18n("install_delete.modal_title"),
        });
        const installPath =
            joinPath(Config.readConfigValue("installFolder"), "installs", dir);
        remove(installPath, (err) => {
            appWin.webContents.send("loading modal", {
                display: false,
            });
            if (!err) {
                appWin.webContents.send("show toast", i18n("install_delete.toast_success"));
            } else {
                appWin.webContents.send("show toast", i18n("install_delete.toast_error"));
            }
            appWin.webContents.send("install list", InstallList.getInstallList());
        });
    });

    ipcMain.on("delete mod", (_, mod) => {
        unlink(joinPath(Config.readConfigValue("installFolder"), "mods", mod), (err) => {
            if (err) {
                appWin.webContents.send("show toast", i18n("mod_delete.toast_error"));
            } else {
                appWin.webContents.send("show toast", i18n("mod_delete.toast_success", mod));
            }
            readMods();
        });
    });

    // Importing the game and mods
    ipcMain.on("import game", () => {
        dialog.showOpenDialog(appWin, {
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
                const hash = hashSync(files[0], {algorithm: "sha256"});
                if (DDLC_HASHES.indexOf(hash) !== -1) {
                    copyFileSync(files[0], joinPath(Config.readConfigValue("installFolder"), "ddlc.zip"));
                    appWin.webContents.send("show onboarding", false);
                } else {
                    appWin.webContents.send("show toast",
                        i18n("game_import.toast_error"));
                }
            }
        });
    });

    ipcMain.on("import mod", () => {
        dialog.showOpenDialog(appWin, {
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
                const filename = files[0].split(pathSep).pop();

                copyFileSync(files[0], joinPath(Config.readConfigValue("installFolder"), "mods", filename));
                appWin.webContents.send("show toast", i18n("mod_import.toast_success", filename));
                readMods();
            }
        });
    });

    ipcMain.on("import mod dropped", (_, mod) => {
        const filename = mod.split(pathSep).pop();
        copyFileSync(mod, joinPath(Config.readConfigValue("installFolder"), "mods", filename));
        appWin.webContents.send("show toast", i18n("mod_import.toast_success", filename));
        readMods();
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

    ipcMain.on("submit feedback", (_, feedback) => {
        let details = feedback.body + "\n\n";

        details += "Version: " + app.getVersion() + "\n";
        details += "Platform: " + process.platform + "\n";
        details += "Arch: " + process.arch + "\n";
        details += "Node Version: " + process.version + "\n";
        details += "Args: " + process.argv.join(" ") + "\n";
        details += "Debug Tools: " + (debug ? "Yes" : "No") + "\n";

        request({
            headers: {
                "User-Agent": "Doki Doki Mod Manager (u/zuudo)",
            },
            json: {
                body: details,
                contact: feedback.contact,
                type: feedback.type,
            },
            method: "POST",
            url: "https://us-central1-doki-doki-mod-manager.cloudfunctions.net/sendFeedback",
        }, () => {
            appWin.webContents.send("show toast", i18n("feedback.toast_sent"));
        });
    });

    ipcMain.on("create shortcut", (_, opts) => {
        if (process.platform !== "win32") {
            dialog.showErrorBox("Shortcut creation is only supported on Windows", "Nice try.");
            return;
        }

        dialog.showSaveDialog(appWin, {
            title: i18n("shortcut.dialog_title"),
            filters: [
                {name: "Shortcut", extensions: ["lnk"]}
            ]
        }, (file) => {
            if (file) {
                Logger.debug("Writing shortcut to " + file);
                console.log(process.argv0, process.argv);
                if (shell.writeShortcutLink(file, "create", {
                    args: opts.installDir,
                    target: process.argv0
                })) {
                    appWin.webContents.send("show toast", i18n("shortcut.toast_success"));
                } else {
                    appWin.webContents.send("show toast", i18n("shortcut.toast_error"));
                }
            }
        });
    });

    sdkServer = new SDKServer(41420, "127.0.0.1");

    let toLaunch = process.argv.pop();
    if ([".", ".."].indexOf(toLaunch) === -1 && existsSync(joinPath(Config.readConfigValue("installFolder"),
        "installs", toLaunch))) {
        launchGame(toLaunch);
    } else {
        appWin.restore();
    }
});
