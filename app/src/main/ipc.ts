import {join as joinPath} from "path";
import Config from "./utils/Config";
import {
    app, BrowserWindow,
    dialog,
    DownloadItem,
    ipcMain,
    IpcMainEvent,
    IpcMainInvokeEvent,
    OpenDialogReturnValue, SaveDialogReturnValue,
    shell
} from "electron";
import InstallList from "./install/InstallList";
import {copyFileSync, existsSync, move, readdirSync, removeSync, unlinkSync} from "fs-extra";
import Logger from "./utils/Logger";
import InstallCreator from "./install/InstallCreator";
import ModInstaller from "./mod/ModInstaller";
import InstallManager from "./install/InstallManager";
import {check as checkUsage, DiskUsage} from "diskusage";
import {downloadLanguageFile} from "./i18n/TranslationDownload";
import I18n from "./i18n/i18n";
import IDiscordManager from "./discord/IDiscordManager";
import InstallLauncher from "./install/InstallLauncher";
import ModList from "./mod/ModList";
import FeatureFlags from "./utils/FeatureFlags";
import DownloadManager from "./net/DownloadManager";
import SpecialCaseManager from "./mod/SpecialCaseManager";

import datauri = require("datauri");

interface InitIPCParams {
    appWindow: Electron.BrowserWindow;
    lang: I18n;
    richPresence: IDiscordManager;
    installLauncher: InstallLauncher;
    modList: ModList;
    featureFlags: FeatureFlags;
    downloadManager: DownloadManager;
    specialCaseManager: SpecialCaseManager;
}

function initIPC({appWindow, lang, richPresence, installLauncher, modList, featureFlags, downloadManager, specialCaseManager}: InitIPCParams) {
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

    async function catchNonFatal(fn: Function) {
        try {
            return fn();
        } catch (e) {
            showError(e, false);
        }
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
        installLauncher.launchInstall(folderName, richPresence).then(() => {
            appWindow.restore(); // show DDMM again
            appWindow.focus();
            appWindow.webContents.send("running cover", {display: false});
        }).catch(e => {
            appWindow.restore();
            appWindow.focus();
            appWindow.webContents.send("running cover", {display: false});
            showError(e, false);
        });
    }

    // ipcMain.on("restart", () => {
    //     app.relaunch();
    //     app.quit();
    // });

    ipcMain.handle("get-mod-list", () => {
        return modList.getModList();
    });

    /*
     * Translate strings!
     */

    ipcMain.on("translate", (ev: IpcMainEvent, query: { key: string, args: string[] }) => { // sync for compatibility
        let passArgs: string[] = query.args;
        passArgs.unshift(query.key);
        ev.returnValue = lang.translate.apply(lang, passArgs);
    });

    /*
     * Interface to shell builtin module and system file browser
     */

    ipcMain.handle("shell-open-url", (ev: IpcMainInvokeEvent, url: string) => {
        return shell.openExternal(url);
    });

    ipcMain.handle("shell-show-file", (ev: IpcMainInvokeEvent, path: string) => {
        shell.showItemInFolder(path);
    });

    ipcMain.handle("shell-browse-mod", async (ev: IpcMainInvokeEvent) => {
        const extensions: string[] = ["zip", "7z", "rar", "rpa"];
        const res: OpenDialogReturnValue = await dialog.showOpenDialog(appWindow, {
            title: lang.translate("main.mod_browse_dialog.title"),
            filters: [{
                extensions: extensions,
                name: lang.translate("main.mod_browse_dialog.file_format_name")
            }],
        })
        if (res.filePaths && res.filePaths[0] && extensions.find(ext => (res.filePaths[0].endsWith("." + ext)))) {
            return res.filePaths[0];
        } else {
            return null;
        }
    });

    ipcMain.handle("shell-browse-directory", async (ev: IpcMainInvokeEvent) => {
        const res: OpenDialogReturnValue = await dialog.showOpenDialog(appWindow, {
            title: lang.translate("main.move_install.title"),
            properties: ["openDirectory"]
        })
        if (res.filePaths && res.filePaths[0]) {
            let error: string = null;

            try {
                const files: string[] = readdirSync(res.filePaths[0]);

                if (files.length > 0) {
                    if (!(files.length <= 4 && files.indexOf("installs") !== -1 && files.indexOf("mods") !== -1)) {
                        error = lang.translate("main.move_install.error_not_empty");
                    }
                }
            } catch {
                error = lang.translate("main.move_install.error_read");
            }

            return {
                error,
                path: res.filePaths[0]
            };
        } else {
            return null;
        }
    });

    /*
     * Config interface
     */

    ipcMain.handle("config-save", (ev: IpcMainInvokeEvent, configData: { key: string, value: any }) => {
        Config.saveConfigValue(configData.key, configData.value);
    });

    ipcMain.on("config-read", (ev: IpcMainEvent, key: string) => {
        ev.returnValue =  Config.readConfigValue(key);
    });

    /*
     * Install management and configuration
     */

    ipcMain.handle("install-launch", (ev: IpcMainInvokeEvent, folderName: string) => {
        return launchInstall(folderName);
    });

    ipcMain.handle("install-kill", () => {
        installLauncher.forceKill();
    });

    ipcMain.handle("install-create", async (ev: IpcMainInvokeEvent, install: { folderName: string, installName: string, globalSave: boolean, mod: string }) => {
        appWindow.setClosable(false);

        Logger.info("IPC", "Creating install in folder " + install.folderName);

        await catchNonFatal(async () => {
            await InstallCreator.createInstall(install.folderName, install.installName, install.globalSave, featureFlags.get("hookInjector"));
            if (install.mod) {
                Logger.info("IPC", "Installing mod " + install.mod + " in " + install.folderName);
                await ModInstaller.installMod(install.mod, joinPath(Config.readConfigValue("installFolder"), "installs", install.folderName, "install"), specialCaseManager)
            }
        });

        appWindow.setClosable(true);
    });

    ipcMain.handle("install-unarchive", async (ev: IpcMainInvokeEvent, install: { folderName: string, mod: string }) => {
        appWindow.setClosable(false);

        await catchNonFatal(async () => {
            await InstallCreator.createInstall(install.folderName);
        });

        if (install.mod) {
            await catchNonFatal(async () => {
                await ModInstaller.installMod(install.mod, joinPath(Config.readConfigValue("installFolder"), "installs", install.folderName, "install"), specialCaseManager);
                launchInstall(install.folderName);
            });
        }

        appWindow.setClosable(true);
    });

    ipcMain.handle("install-rename", async (ev: IpcMainInvokeEvent, options: { folderName: string, newName: string }) => {
        Logger.info("IPC", "Renaming install in " + options.folderName + " to " + options.newName)
        await catchNonFatal(async () => {
            await InstallManager.renameInstall(options.folderName, options.newName);
        });
    });

    ipcMain.handle("install-archive", async (ev: IpcMainInvokeEvent, folderName: string) => {
        await catchNonFatal(async () => {
            await InstallManager.archiveInstall(folderName);
        });
    });

    ipcMain.handle("install-delete", async (ev: IpcMainInvokeEvent, folderName: string) => {
        await catchNonFatal(async () => {
            await InstallManager.deleteInstall(folderName);
        });
    });

    ipcMain.handle("install-reset", async (ev: IpcMainInvokeEvent, folderName: string) => {
        await catchNonFatal(async () => {
            await InstallManager.deleteSaveData(folderName);
        });
    });

    ipcMain.handle("install-set-category", async (ev: IpcMainInvokeEvent, options: { folderName: string, category: string }) => {
        await catchNonFatal(async () => {
            await InstallManager.setCategory(options.folderName, options.category)
        });
    });

    ipcMain.handle("install-create-shortcut", async (ev: IpcMainInvokeEvent, options: { folderName: string, installName: string }) => {
        if (process.platform !== "win32") {
            Logger.warn("IPC", "install-create-shortcut was invoked on " + process.platform + "!")
            return;
        }

        await catchNonFatal(async () => {
            const file: string = (await dialog.showSaveDialog(appWindow, {
                title: lang.translate("main.shortcut_dialog.title"),
                defaultPath: options.installName,
                filters: [
                    {name: lang.translate("main.shortcut_dialog.file_format_name"), extensions: ["lnk"]}
                ]
            })).filePath;

            if (file) {
                Logger.info("IPC", "Creating shortcut to " + options.folderName);
                shell.writeShortcutLink(file, "create", {
                    target: "ddmm://launch-install/" + options.folderName,
                    icon: process.execPath,
                    iconIndex: 0
                });
            }
        });
    });

    ipcMain.handle("install-get-background", async (ev: IpcMainInvokeEvent, folderName: string) => {
        const installFolder: string = joinPath(Config.readConfigValue("installFolder"), "installs");

        let bgPath: string = joinPath(installFolder, folderName, "ddmm-bg.png");
        let bgDataURL: string;

        let screenshots: string[];

        try {
            screenshots = readdirSync(joinPath(installFolder, folderName, "install")).filter(fn => {
                return fn.match(/^screenshot(\d+)\.png$/);
            });
        } catch (e) {
            screenshots = [];
        }

        if (existsSync(bgPath)) {
            bgDataURL = await datauri(bgPath);
        } else if (screenshots.length > 0) {
            bgDataURL = await datauri(joinPath(installFolder, folderName, "install", screenshots[Math.floor(Math.random() * screenshots.length)]));
        }

        return bgDataURL;
    });

    ipcMain.handle("install-get-screenshot", async (ev: IpcMainInvokeEvent, opts: { install: string, filename: string }) => {
        const installFolder: string = joinPath(Config.readConfigValue("installFolder"), "installs");

        let screenshotPath: string = joinPath(installFolder, opts.install, "install", opts.filename);
        let bgDataURL: string;

        if (existsSync(screenshotPath)) {
            bgDataURL = await datauri(screenshotPath);
        }

        return bgDataURL;
    });

    ipcMain.handle("install-path-exists", async (ev: IpcMainInvokeEvent, folderName: string) => {
        if (!folderName || typeof folderName !== "string") {
            return false;
        } else {
            return InstallManager.installExists(folderName);
        }
    });

    ipcMain.handle("install-get-list", () => {
        const installList = InstallList.getInstallList();
        console.log(installList);
        return installList;
    });

    /*
     * Download management
     */

    ipcMain.handle("downloads-list", () => {
        return downloadManager.getActiveDownloads().map((dl: DownloadItem) => {
            return {
                filename: dl.getFilename(),
                downloaded: dl.getReceivedBytes(),
                total: dl.getTotalBytes(),
                startTime: dl.getStartTime() * 1000
            }
        });
    });

    ipcMain.handle("download-start", async (ev: IpcMainInvokeEvent, data: { url: string, interaction?: boolean }) => {
        if (data.interaction) {
            await downloadManager.downloadFileWithInteraction(data.url);
        } else {
            downloadManager.downloadFile(data.url);
        }
    });

    ipcMain.handle("download-preload", (ev: IpcMainInvokeEvent, name: string) => {
        downloadManager.preloadFilename(name);
    });

    /*
     * Mod management
     */

    ipcMain.handle("mod-delete", async (ev: IpcMainInvokeEvent, fileName: string) => {
        await catchNonFatal(() => {
            unlinkSync(joinPath(Config.readConfigValue("installFolder"), "mods", fileName));
        });
    });

    /*
     * Misc system tasks
     */

    ipcMain.handle("system-move-install", async (ev: IpcMainInvokeEvent, newInstallFolder: string) => {
        appWindow.hide();
        const oldInstallFolder: string = Config.readConfigValue("installFolder");
        move(oldInstallFolder, newInstallFolder, {overwrite: true}, e => {
            if (e) {
                Logger.warn("Install Move", "Failed to move install directory: " + e.message);
                dialog.showErrorBox(lang.translate("main.errors.move_install.title"), lang.translate("main.errors.move_install.body"));
            } else {
                Config.saveConfigValue("installFolder", newInstallFolder);
            }
            app.relaunch();
            app.quit();
        });
    });

    // ipcMain.handle("system-get-backgrounds", async (ev: IpcMainInvokeEvent) => {
    //     return readdirSync(joinPath(__dirname, "../../src/renderer/images/backgrounds"));
    // });

    ipcMain.on("system-get-constants", (ev: IpcMainEvent) => {
        ev.returnValue = global.ddmm_constants;
    });

    ipcMain.on("system-get-feature-flag", (ev: IpcMainEvent, flag: string) => {
        ev.returnValue = featureFlags.get(flag);
    });

    ipcMain.on("system-debug-crash", () => {
        throw new Error("User forced debug crash with DevTools");
    });

    ipcMain.handle("system-get-space", async (ev: IpcMainEvent, path: string) => {
        try {
            const usage: DiskUsage = await checkUsage(path);
            return usage.free;
        } catch (e) {
            return 999999; // assume there is space
        }
    });

    // ipcMain.on("import mas", (ev: IpcMainEvent, folderName: string) => {
    //     dialog.showOpenDialog(appWindow, {
    //         title: lang.translate("main.import_mas.title"),
    //         filters: [
    //             {
    //                 name: lang.translate("main.import_mas.filter"),
    //                 extensions: ["*"]
    //             }
    //         ]
    //     }).then((res: OpenDialogReturnValue) => {
    //         if (res.filePaths && res.filePaths[0]) {
    //             copyFileSync(res.filePaths[0], joinPath(Config.readConfigValue("installFolder"), "installs", folderName, "install", "characters", "monika"));
    //             removeSync(res.filePaths[0]);
    //             InstallManager.setMonikaExported(folderName, false).then(() => {
    //                 refreshInstalls();
    //             });
    //         }
    //     });
    // });
    //
    // ipcMain.on("export mas", (ev: IpcMainEvent, folderName: string) => {
    //     dialog.showSaveDialog(appWindow, {
    //         title: lang.translate("main.export_mas.title"),
    //         defaultPath: "monika",
    //         filters: [
    //             {
    //                 name: lang.translate("main.export_mas.filter"),
    //                 extensions: ["*"]
    //             }
    //         ]
    //     }).then((dialogReturn: SaveDialogReturnValue) => {
    //         if (dialogReturn.filePath) {
    //             Logger.info("MAS", "Exporting Monika from " + folderName);
    //             const source: string = joinPath(Config.readConfigValue("installFolder"), "installs", folderName, "install", "characters", "monika");
    //             copyFileSync(source, dialogReturn.filePath);
    //             removeSync(source);
    //             InstallManager.setMonikaExported(folderName, true).then(() => {
    //
    //             });
    //         }
    //     });
    // });
    //
    // ipcMain.on("reload languages", () => {
    //     downloadLanguageFile(Config.readConfigValue("language")).catch(err => {
    //         console.warn("Language update failed", err);
    //     }).finally(() => {
    //         lang.reinitialise();
    //         appWindow.webContents.send("languages reloaded");
    //     });
    // });

    ipcMain.on("window-close", () => {
       appWindow.close();
    });

    ipcMain.on("window-maximise", () => {
        appWindow.maximize();
    });

    ipcMain.on("window-minimise", () => {
        appWindow.minimize();
    });

    process.on("uncaughtException", (e: Error) => {
        Logger.error("Application", "An uncaught exception occurred in the main process");
        console.error(e);
        showError(
            e,
            true
        );
    });
}

export {initIPC};