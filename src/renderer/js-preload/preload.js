/*
    The preload script contains all of the IPC logic to communicate with the main process.
    It avoids exposing node context to the renderer process which could lead to e.g. self-XSS

    THIS CODE HAS FULL ACCESS TO THE NODE.JS RUNTIME! Be careful.
 */

const packageData = require("../../../package");
const {ipcRenderer} = require("electron");
const EventEmitter = require("events");

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

api.launchInstall = function (folderName) {
    ipcRenderer.send("launch install", folderName);
};

// Restart the app
api.restart = function () {
    ipcRenderer.send("restart");
};

// Open URL in browser
api.openURL = function (url) {
    ipcRenderer.send("open url", url);
};

api.browseForMod = function() {
    ipcRenderer.send("browse mods");
};

// Localisation function
api.translate = function (key, ...args) {
    return ipcRenderer.sendSync("translate", {
        "key": key,
        "args": args
    });
};

api.setWindowClosable = function (flag) {
    ipcRenderer.send("closable", flag);
};

// Application version
api.version = packageData.version;

global.ddmm = api;

if (process.env.NODE_ENV === "development") {
    window.__devtron = {require: require, process: process};
}