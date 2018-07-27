const Vue = require("vue/dist/vue");

const packageData = require("../../../../package");

const Mousetrap = require("mousetrap");
const bytes = require("bytes");
const normaliseURL = require("normalize-url");

const {ipcRenderer, remote} = require("electron");
const {shell, dialog} = remote;

const semver = require("semver");

let toastTimeout = -1;

const vueApp = new Vue({
    "el": "#app",
    "data": {
        "ui": {
            "debug_features": false,
            "side_sheets": {
                "uikit": false,
                "downloads": false,
                "about": false,
                "settings": false,
                "onboarding": true,
                "install": false,
                "browser": false,
                "save_management": false,
                "theme": false,
            },
            "modals": {
                "delete_save": false,
                "delete_install": false,
                "create_install": false,
                "delete_mod": false
            },
            "loading_modal": {

            },
            "toast": {
                "message": "",
                "visible": false
            },
            "update": {
                "checked": false,
                "available": false,
                "downloaded": false,
                "data": null
            },
            "onboarding": {
                "downloading": false
            },
            "browser": {
                "url": "Loading browser"
            },
            "install_creation": {
                "install_name": "",
                "folder_name": ""
            },
            "selected_install": 0,
            "selected_mod": null,
            "running_cover": false,
            "monika": false,
            "banner": {
                "active": false,
                "message": "",
                "url": ""
            },
            "ready": false,
            "theme": "light",
        },
        "downloads": [],
        "installs": [],
        "mods": ["DDTAR - Mod Manager.zip"]
    },
    "methods": {
        "showToast": function (msg) {
            this.ui.toast.message = msg;
            this.ui.toast.visible = true;
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                this.ui.toast.visible = false;
            }, 5000);
        },
        "openDevTools": function () {
            ipcRenderer.send("open devtools");
        },
        "crashMainProcess": function (e) {
            if (e.ctrlKey) {
                ipcRenderer.send("debug crash");
            } else {
                vueApp.showToast("Hold CTRL while clicking to induce a crash.");
            }
        },
        "openURL": function (url) {
            shell.openExternal(url);
        },
        "roundedPercentage": function (numerator, denominator) {
            return Math.floor((numerator / denominator) * 100) || 0;
        },
        "formatBytes": function (val) {
            return bytes.format(val, {
                decimalPlaces: 0
            });
        },
        "calculateDownloadSpeed": function (downloadedBytes, startTime, round) { // in mb/s
            const speed = (downloadedBytes / (1000 * 1000)) / ((Date.now() / 1000) - startTime) || 0;
            if (round) {
                return (Math.floor((speed * 10)) / 10).toFixed(1);
            } else {
                return speed;
            }
        },
        "calculateETA": function (downloadedBytes, totalBytes, startTime) {
            const speed = this.calculateDownloadSpeed(downloadedBytes, startTime);
            if (speed === 0) return "∞";
            return Math.floor(((totalBytes - downloadedBytes) / (1000 * 1000)) / speed) + 1; // don't tell anyone you saw this
        },
        "removeDownload": function (id) {
            ipcRenderer.send("remove download", id);
        },
        "downloadGame": function () {
            this.ui.onboarding.downloading = true;
            ipcRenderer.send("download game");
        },
        "browserCommand": function (command) {
            document.querySelector("#browser")[command]();
        },
        "browserBarHandler": function (e) {
            if (e.keyCode === 13) {
                document.querySelector("#browser").loadURL(normaliseURL(this.ui.browser.url));
                this.ui.browser.url = normaliseURL(this.ui.browser.url);
            }
        },
        "launchInstall": function (dir) {
            ipcRenderer.send("launch install", dir);
        },
        "deleteFirstrun": function (dir) {
            ipcRenderer.send("delete firstrun", dir);
        },
        "deleteSave": function (dir) {
            ipcRenderer.send("delete save", dir);
        },
        "deleteInstall": function (dir) {
            ipcRenderer.send("delete install", dir);
        },
        "createInstall": function (folderName, installName, globalSave) {
            ipcRenderer.send("create install", {folderName, installName, globalSave, modZip: this.ui.selected_mod});
        },
        "generateFolderName": function () {
            this.ui.install_creation.folder_name = this.ui.install_creation.install_name.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, "-").replace(/-{2,}/g, "-").replace(/^-/, "").replace(/-$/, "");
        },
        "installUpdate": function () {
            ipcRenderer.send("install update");
        },
        "checkUpdate": function () {
            ipcRenderer.send("check update");
        },
        "bannerClick": function () {
            if (this.ui.banner.url) {
                shell.openExternal(this.ui.banner.url);
            }
        },
        "bannerDismiss": function () {
            localStorage.setItem("last_banner", vueApp.ui.banner.message);
            this.ui.banner.active = false
        },
        "deleteMod": function (mod) {
            ipcRenderer.send("delete mod", mod);
        },
        "importGame": function() {
            ipcRenderer.send("import game");
        },
        "importMod": function() {
            ipcRenderer.send("import mod");
            this.ui.side_sheets.install = false;
        },
        "cancelDownload": function(id) {
            ipcRenderer.send("cancel download", id);
        }
    },
    "computed": {
        "selectedInstall": function () {
            if (this.ui.selected_install !== -1) {
                return this.installs[this.ui.selected_install];
            } else {
                return {
                    "name": "Doki Doki Literature Club!",
                    "filename": null,
                    "directory": "ddlc"
                }
            }
        }
    }
});

ipcRenderer.on("show toast", (_, msg) => {
    vueApp.showToast(msg);
});

ipcRenderer.on("update info", (_, info) => {
    vueApp.ui.update.checked = true;
    vueApp.ui.update.info = info;
    if (info.update) {
        vueApp.ui.update.available = semver.gt(info.update.updateInfo.version, packageData.version);
    }
});

ipcRenderer.on("download queue", (_, queue) => {
    vueApp.downloads = queue;
});

ipcRenderer.on("download completed", (_, queue) => {
    vueApp.completed_downloads = queue;
});

ipcRenderer.on("show onboarding", (_, show) => {
    vueApp.ui.side_sheets.onboarding = show;
});

ipcRenderer.on("show monika", () => {
    vueApp.ui.monika = true;
    document.querySelector("#monika").play();
});

ipcRenderer.on("running cover", (_, show) => {
    vueApp.ui.running_cover = show;
});

ipcRenderer.on("show crash", () => {
    // do nothing for now
});

ipcRenderer.on("install list", (_, list) => {
    vueApp.installs = list;
});

ipcRenderer.on("mod list", (_, list) => {
    vueApp.mods = list;
});

ipcRenderer.on("loading modal", (_, details) => {
    vueApp.ui.loading_modal = details;
});

ipcRenderer.on("update downloaded", () => {
    vueApp.ui.update.downloaded = true;
});

ipcRenderer.on("ready", () => {
   vueApp.ui.ready = true;
});

// debug keybind
Mousetrap.bind("j u s t m o n i k a", () => {
    ipcRenderer.send("enable debug");
});

document.querySelector("#monika").addEventListener("ended", () => {
    vueApp.ui.monika = false;
});

document.querySelector("#browser").addEventListener("will-navigate", evt => {
    if (!(evt.url.startsWith("data:"))) {
        vueApp.ui.browser.url = evt.url;
    }
});

document.querySelector("#browser").addEventListener("did-stop-loading", () => {
    if (!(document.querySelector("#browser").getURL().startsWith("data:"))) {
        vueApp.ui.browser.url = document.querySelector("#browser").getURL();
    }
});

document.querySelector("#browser").addEventListener("did-fail-load", evt => {
    document.querySelector("#browser").loadURL("data:text/html;base64," + btoa(`<h1>Error loading page</h1><p>${evt.errorDescription}</p><p>Please try loading a different page.</p>`));
});

firebase.database().ref("/global/banner").once("value").then(response => {
    vueApp.ui.banner = response.val();
    if (localStorage.getItem("last_banner") === vueApp.ui.banner.message) {
        vueApp.ui.banner.active = false;
    }

});