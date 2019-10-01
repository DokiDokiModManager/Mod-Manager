/*
    The preload script contains all of the IPC logic to communicate with the main process.
    It avoids exposing node context to the renderer process which could lead to e.g. self-XSS

    THIS CODE HAS FULL ACCESS TO THE NODE.JS RUNTIME! Be careful.
 */

const {ipcRenderer, remote} = require("electron");
const EventEmitter = remote.require("events");
const packageData = remote.require("../../package");
const path = remote.require("path");
const datauri = remote.require("datauri");

const api = new EventEmitter();

api.mods = {};
api.app = {};
api.window = {};
api.config = {};
api.onboarding = {};
api.account = {};

// Called when the UI wants to refresh the mod list
api.mods.refreshModList = function () {
    ipcRenderer.send("get modlist");
};

// Called when the UI wants to refresh the install list
api.mods.refreshInstallList = function () {
    ipcRenderer.send("get installs");
};

// Open a browse dialog for mods to be imported
api.mods.browseForMod = function () {
    return ipcRenderer.sendSync("browse mods");
};

// Launches an install
api.mods.launchInstall = function (folderName) {
    ipcRenderer.send("launch install", folderName);
};

// Creates an install
api.mods.createInstall = function (options) {
    ipcRenderer.send("create install", options);
};

// File exists?
api.mods.installExists = function (folderName) {
    return ipcRenderer.sendSync("install exists", folderName);
};

// Download mod
api.mods.download = function (url) {
    ipcRenderer.send("download mod", url);
};

api.mods.getInstallBackground = function (install) {
    return ipcRenderer.sendSync("get install background", install);
};

// Fires an event on the DDMM object when the mod list has been retrieved
ipcRenderer.on("got modlist", (ev, list) => {
    api.emit("mod list", list);
});

// Fires an event on the DDMM object when the install list has been retrieved
ipcRenderer.on("got installs", (ev, list) => {
    api.emit("install list", list);
});

// Fires an event when the running cover should be shown / hidden
ipcRenderer.on("running cover", (ev, data) => {
    api.emit("running cover", data);
});

// Restart the app
api.app.restart = function () {
    ipcRenderer.send("restart");
};

// Open URL in browser
api.app.openURL = function (url) {
    ipcRenderer.send("open url", url);
};

// Show file in file manager
api.app.showFile = function (path) {
    ipcRenderer.send("show file", path);
};

// Crash the app, for testing
api.app.crash = function () {
    ipcRenderer.send("debug crash");
};

// Get disk space
api.app.getDiskSpace = function () {
    return ipcRenderer.sendSync("disk space");
};

// Clipboard copy
api.app.copyToClipboard = function (text) {
    remote.clipboard.writeText(text);
};

// Localisation function
api.translate = function (key, ...args) {
    return ipcRenderer.sendSync("translate", {
        "key": key,
        "args": args
    });
};

// Path to URL conversion
api.fileToURL = function (file) {
    try {
        return path.isAbsolute(file) ? datauri.sync(file) : datauri.sync(path.join(remote.app.getAppPath(), file));
    } catch {
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuNv1OCegAAAANSURBVBhXY2BgYEgBAABpAGW2L9BbAAAAAElFTkSuQmCC";
    }
};

api.fileToURLAsync = function (file) {
    return new Promise(ff => {
        datauri.promise(path.isAbsolute(file) ? file : path.join(remote.app.getAppPath(), file)).then(uri => {
            ff(uri);
        }).catch(() => {
            ff("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuNv1OCegAAAANSURBVBhXY2BgYEgBAABpAGW2L9BbAAAAAElFTkSuQmCC");
        });
    });
};

// Close window
api.window.close = function () {
    remote.getCurrentWindow().close();
};

// Maximise or restore window
api.window.maximise = function () {
    if (remote.getCurrentWindow().isMaximized()) {
        remote.getCurrentWindow().restore();
    } else {
        remote.getCurrentWindow().maximize();
    }
};

// Minimise window
api.window.minimise = function () {
    remote.getCurrentWindow().minimize();
};

// Prompt
api.window.prompt = function (data) {
    api.emit("prompt", data);
};

// Input
api.window.input = function (data) {
    api.emit("input", data);
};

// Devtools
api.window.openDevtools = function () {
    remote.getCurrentWindow().webContents.openDevTools({mode: "detach"});
};

// Change a setting in config
api.config.saveConfigValue = function (k, v) {
    ipcRenderer.send("save config", {"key": k, "value": v});
};

// Read a setting from config
api.config.readConfigValue = function (k) {
    return ipcRenderer.sendSync("read config", k);
};

// Delete install
api.mods.renameInstall = function (folderName, newName) {
    ipcRenderer.send("rename install", {folderName, newName});
};

// Delete install
api.mods.deleteInstall = function (folderName) {
    ipcRenderer.send("delete install", folderName);
};

// Delete mod
api.mods.deleteMod = function (fileName) {
    ipcRenderer.send("delete mod", fileName);
};

// Delete save data
api.mods.deleteSaveData = function (folderName) {
    ipcRenderer.send("delete save", folderName);
};

// Create shortcut
api.mods.createShortcut = function (folderName, installName) {
    ipcRenderer.send("create shortcut", {folderName, installName});
};

// Change category
api.mods.setCategory = function(folderName, category) {
    ipcRenderer.send("set category", {folderName, category});
};

// Import / export Monika
api.mods.importMAS = function(folderName) {
    ipcRenderer.send("import mas", folderName);
};

api.mods.exportMAS = function(folderName) {
    ipcRenderer.send("export mas", folderName);
};

// Move install folder
api.app.beginMoveInstall = function () {
    ipcRenderer.send("move install");
};

// Get available backgrounds
api.app.getBackgrounds = function () {
    return ipcRenderer.sendSync("get backgrounds");
};

// Handler for crashes / errors
ipcRenderer.on("error message", (ev, data) => {
    api.emit("error", data);
});

// Handler for debug info
ipcRenderer.on("debug info", (ev, data) => {
    api.debug = data;
});

// Handler for updates
ipcRenderer.on("updating", (ev, status) => {
    api.emit("updating", status);
});

api.app.downloadUpdate = function () {
    ipcRenderer.send("download update");
};

// Onboarding flow trigger
ipcRenderer.on("start onboarding", () => {
    api.emit("start onboarding");
});

// Check for updates
api.app.update = function () {
    ipcRenderer.send("check update");
};

// Onboarding download
api.onboarding.downloadGame = function () {
    ipcRenderer.send("onboarding download");
};

api.onboarding.browseForGame = function () {
    ipcRenderer.send("onboarding browse");
};

ipcRenderer.on("download progress", (_, data) => {
    api.emit("download progress", data);
});

ipcRenderer.on("download stalled", (_, data) => {
    api.emit("download stalled", data);
});

ipcRenderer.on("onboarding downloaded", () => {
    api.emit("onboarding downloaded");
});

ipcRenderer.on("onboarding download failed", () => {
    api.emit("onboarding download failed");
});

// Winstore Appx UI handling
ipcRenderer.on("is appx", (_, is) => {
    api.emit("is appx", is);
});

api.reloadLanguages = function() {
  ipcRenderer.send("reload languages");
};

// Application version
api.version = packageData.version;

// System platform
api.platform = process.platform;

// Environment variables
api.env = process.env;

// Join paths
api.joinPath = path.join;

// Is absolute
api.isAbsolute = path.isAbsolute;

// make the API visible to the renderer
global.ddmm = api;

console.info(`%cWarning! This is the developer console!

Before you type anything here, make sure you know what you're doing. Certain commands could do damage to your game installs or even your computer.`,
    "font-size: 16px");