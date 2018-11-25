import {app, BrowserWindow, ipcMain, IpcMessageEvent, shell, dialog, Notification} from "electron";
import {join as joinPath} from "path";
import ModList from "./mod_list";
import I18n from "./i18n";
import InstallList from "./install_list";
import InstallLauncher from "./install_launcher";
import Config from "./config";

// region Flags and references

// Permanent reference to the main app window
let appWindow: BrowserWindow;

// Flag for allowing the app window to be closed
let windowClosable: boolean = true;

const lang: I18n = new I18n(app.getLocale());

// endregion

// region IPC functions

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

// Toggle closeable flag
ipcMain.on("closable", (ev: IpcMessageEvent, flag: boolean) => {
    windowClosable = flag;
    appWindow.setClosable(flag);
});

// Config IPC functions
ipcMain.on("save config", (ev: IpcMessageEvent, configData: { key: string, value: any}) => {
   Config.saveConfigValue(configData.key, configData.value);
});

ipcMain.on("read config", (ev: IpcMessageEvent, key: string) => {
   ev.returnValue = Config.readConfigValue(key);
});

// Launch install
ipcMain.on("launch install", (ev: IpcMessageEvent, folderName: string) => {
    appWindow.minimize(); // minimise the window to draw attention to the fact another window will be appearing
    appWindow.webContents.send("running cover", {
        display: true,
        dismissable: false,
        title: lang.translate("running_cover.running.title"),
        description: lang.translate("running_cover.running.description")
    });
    InstallLauncher.launchInstall(folderName).then(() => {
        appWindow.restore(); // show DDMM again
        appWindow.webContents.send("running cover", {display: false});
    }).catch(err => {
        appWindow.restore();
        appWindow.webContents.send("running cover", {
            display: true,
            dismissable: true,
            title: lang.translate("running_cover.error.title"),
            description: err
        });
    });
});

// Browse for a mod
ipcMain.on("browse mods", (ev: IpcMessageEvent) => {
    dialog.showOpenDialog(appWindow, {
        buttonLabel: lang.translate("mods.browse_dialog.button_label"),
        title: lang.translate("mods.browse_dialog.title"),
        filters: [{extensions: ["zip"], name: lang.translate("mods.browse_dialog.file_format_name")}]
    });
});

// endregion

// region App initialisation
process.on("uncaughtException", () => {
    const crashNotif = new Notification({
        title: lang.translate("exceptions.main_crash_notification.title"),
        body: lang.translate("exceptions.main_crash_notification.body"),
    });

    crashNotif.show();
    app.quit();
});

app.on("ready", () => {

    app.setAppUserModelId("space.doki.modmanager");

    appWindow = new BrowserWindow({
        title: "Doki Doki Mod Manager",
        width: 1200,
        height: 800,
        minWidth: 1000,
        minHeight: 800,
        webPreferences: {
            sandbox: true,
            nodeIntegration: false,
            preload: joinPath(__dirname, "../renderer/js-preload/preload.js") // contains all the IPC scripts
        },
        show: false
    });

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

    appWindow.setMenuBarVisibility(false);

    appWindow.loadFile(joinPath(__dirname, "../renderer/html/index.html"));
});
// endregion