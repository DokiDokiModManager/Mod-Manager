const {ipcRenderer, contextBridge} = require("electron");

const api = {
    translate(key, ...args) {
        return ipcRenderer.sendSync("translate", {
            "key": key,
            "args": args
        });
    },
    config: {
        readConfigValue(key) {
            return ipcRenderer.sendSync("config-read", key);
        },
        saveConfigValue(key, value) {
            return ipcRenderer.invoke("config-save", {key, value});
        }
    },
    shell: {
        openURL(url) {
            return ipcRenderer.invoke("shell-open-url", url);
        },
        showFile(path) {
            return ipcRenderer.invoke("shell-show-file", path);
        },
        browse: {
            mod() {
                return ipcRenderer.invoke("shell-browse-mod");
            },
            directory() {
                return ipcRenderer.invoke("shell-browse-directory");
            }
        }
    },
    install: {
        getList() {
            return ipcRenderer.invoke("install-get-list");
        },
        launch(folderName) {
            return ipcRenderer.invoke("install-launch", folderName);
        },
        kill() {
            return ipcRenderer.invoke("install-kill");
        },
        create(options) {
            return ipcRenderer.invoke("install-create", options);
        },
        unarchive(folderName, mod) {
            return ipcRenderer.invoke("install-create", {folderName, mod});
        },
        rename(folderName, newName) {
            return ipcRenderer.invoke("install-rename", {folderName, newName});
        },
        archive(folderName) {
            return ipcRenderer.invoke("install-archive", folderName);
        },
        delete(folderName) {
            return ipcRenderer.invoke("install-delete", folderName);
        },
        reset(folderName) {
            return ipcRenderer.invoke("install-reset", folderName);
        },
        setCategory(folderName, category) {
            return ipcRenderer.invoke("install-set-category", {folderName, category});
        },
        createShortcut(folderName, installName) {
            return ipcRenderer.invoke("install-create-shortcut", {folderName, installName});
        },
        getBackground(folderName) {
            return ipcRenderer.invoke("install-get-background", folderName);
        },
        getScreenshot(install, filename) {
            return ipcRenderer.invoke("install-get-screenshot", {install, filename});
        },
        pathExists(folderName) {
            return ipcRenderer.invoke("install-path-exists", folderName);
        }
    },
    downloads: {
        getList() {
            return ipcRenderer.invoke("downloads-list");
        },
        start(url, interaction) {
            return ipcRenderer.invoke("download-start", {url, interaction});
        },
        preloadFilename(name) {
            return ipcRenderer.invoke("download-preload", name);
        }
    },
    mod: {
        delete(filename) {
            return ipcRenderer.invoke("mod-delete", filename);
        }
    },
    system: {
        moveInstall() {
            // todo
        },
        getFeatureFlag(flag) {
            return ipcRenderer.sendSync("system-get-feature-flag", flag);
        },
        debugCrash() {
            return ipcRenderer.send("system-debug-crash");
        },
        getFreeSpace(path) {
            return ipcRenderer.invoke("system-get-space", path);
        }
    },
    window: {
        close() {
            return ipcRenderer.send("window-close");
        },
        maximise() {
            return ipcRenderer.send("window-maximise");
        },
        minimise() {
            return ipcRenderer.send("window-minimise");
        }
    },
    joinPath() {
        return "";
    },
    version: "lolidk",
    platform: process.platform,
    env: process.env,
    constants: ipcRenderer.sendSync("system-get-constants")
};

contextBridge.exposeInMainWorld("ddmm", api);

console.info(`%cWarning! This is the developer console!

Before you type anything here, make sure you know what you're doing. Certain commands could do damage to your game installs or even your computer.`,
    "font-size: 16px");
