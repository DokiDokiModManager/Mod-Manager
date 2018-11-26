/*
    The preload script contains all of the IPC logic to communicate with the main process.
    It avoids exposing node context to the renderer process which could lead to e.g. self-XSS

    THIS CODE HAS FULL ACCESS TO THE NODE.JS RUNTIME! Be careful.
 */

const {ipcRenderer, remote} = require("electron");
const EventEmitter = remote.require("events");
const packageData = remote.require("../../package");
const path = remote.require("path");

const api = new EventEmitter();

// Called when the UI wants to refresh the mod list
api.refreshModList = function () {
    ipcRenderer.send("get modlist");
};

// Fires an event on the DDMM object when the mod list has been retrieved
ipcRenderer.on("got modlist", (ev, list) => {
    api.emit("mod list", list);
});

// Called when the UI wants to refresh the install list
api.refreshInstallList = function () {
    ipcRenderer.send("get installs");
};

// Fires an event on the DDMM object when the install list has been retrieved
ipcRenderer.on("got installs", (ev, list) => {
    api.emit("install list", list);
});

// Fires an event when the running cover should be shown / hidden
ipcRenderer.on("running cover", (ev, data) => {
    console.log("Running cover updated", data);
    api.emit("running cover", data);
});

// Launches an install
api.launchInstall = function (folderName) {
    ipcRenderer.send("launch install", folderName);
};

// Creates an install
api.createInstall = function(folderName, installName, globalSave, mod) {
    ipcRenderer.send("create install", {folderName, installName, globalSave, mod});
};

// Restart the app
api.restart = function () {
    ipcRenderer.send("restart");
};

// Open URL in browser
api.openURL = function (url) {
    ipcRenderer.send("open url", url);
};

// Open a browse dialog for mods to be imported
api.browseForMod = function () {
    return ipcRenderer.sendSync("browse mods");
};

// Localisation function
api.translate = function (key, ...args) {
    return ipcRenderer.sendSync("translate", {
        "key": key,
        "args": args
    });
};

// Toggle the ability to close the DDMM window to prevent loss of data
api.setWindowClosable = function (flag) {
    ipcRenderer.send("closable", flag);
};

// Change a setting in config
api.saveConfigValue = function(k, v) {
  ipcRenderer.send("save config", {"key": k, "value": v});
};

// Read a setting from config
api.readConfigValue = function(k) {
    return ipcRenderer.sendSync("read config", k);
};

// Application version
api.version = packageData.version;

// Join paths
api.joinPath = path.join;

// make the API visible to the renderer
global.ddmm = api;


console.warn(`Welcome, traveller.

Before you type anything here, make sure you know what you're doing. Certain commands could bork your install.`);
