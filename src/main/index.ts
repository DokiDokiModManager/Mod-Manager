import {app, BrowserWindow, ipcMain, IpcMessageEvent, shell} from "electron";
import {join as joinPath} from "path";
import ModList from "./mod_list";
import I18n from "./i18n";
import InstallList from "./install_list";
import InstallLauncher from "./install_launcher";

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

// Launch install
ipcMain.on("launch install", (ev: IpcMessageEvent, folderName: string) => {
    appWindow.webContents.send("running cover", {
        display: true,
        dismissable: false,
        title: lang.translate("running_cover.running.title"),
        description: lang.translate("running_cover.running.description")
    });
    InstallLauncher.launchInstall(folderName).then(() => {
        appWindow.webContents.send("running cover", {display: false});
    }).catch(err => {
        appWindow.webContents.send("running cover", {
            display: true,
            dismissable: true,
            title: lang.translate("running_cover.error.title"),
            description: err
        });
    });
});

// endregion

// region App initialisation
app.on("ready", () => {

    app.setAppUserModelId("space.doki.modmanager");

    appWindow = new BrowserWindow({
        title: "Doki Doki Mod Manager",
        width: 1000,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            preload: joinPath(__dirname, "../renderer/js-preload/preload.js") // contains all the IPC scripts
        },
    });

    appWindow.on("close", (ev) => {
        if (!windowClosable) {
            ev.preventDefault();
        }
    });

    appWindow.on("closed", () => {
        appWindow = null;
        app.quit();
    });

    appWindow.setMenuBarVisibility(false);

    if (process.env.NODE_ENV === "development") {
        require("devtron").install();
    }

    appWindow.loadFile(joinPath(__dirname, "../renderer/html/index.html"));
});
// endregion