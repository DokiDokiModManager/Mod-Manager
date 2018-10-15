const Vue = require("vue/dist/vue");

const packageData = require("../../../package");
const Language = require("../../common/i18n/i18n");

const Mousetrap = require("mousetrap");
const bytes = require("bytes");
const Fuse = require("fuse.js");

const {ipcRenderer, remote} = require("electron");
const {shell, dialog} = remote;

const semver = require("semver");

const i18n = Language(remote.app.getLocale());

let toastTimeout = -1;

let installListSearch, modListSearch;

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
                "save_management": false,
                "theme": false,
                "inference": false,
                "achievements": false,
                "feedback": false
            },
            "modals": {
                "delete_save": false,
                "delete_install": false,
                "create_install": false,
                "delete_mod": false
            },
            "loading_modal": {},
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
            "install_creation": {
                "install_name": "",
                "folder_name": "",
                "global_save": false
            },
            "selected_install": null,
            "selected_mod": null,
            "running_cover": false,
            "banner": {
                "active": false,
                "message": "",
                "url": ""
            },
            "ready": false,
            "theme": "light",
            "version": packageData.version,
            "inference": {
                "mapper": "",
                "mod": "",
                "delete": []
            },
            "feedback": {
                "type": "question",
                "body": "",
                "contact": ""
            },
            "search": {
                "installs": "",
                "mods": ""
            },
            "running_install": null,
            "platform": process.platform,
            "mod_submit_url": "https://docs.google.com/forms/d/e/1FAIpQLSd7jwBCw_0PWQGkGF_-sey0FRAsrouPX2QtDsfqDEDv2MLN5g/viewform?usp=sf_link",
            "new_install_name": ""
        },
        "installs": [],
        "mods": [],
        "recommended_mods": {},
        "download": {
            "downloading": false,
            "has_download_completed": false,
            "filename": "",
            "total_bytes": 1,
            "received_bytes": 0
        }
    },
    "methods": {
        "_": i18n,
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
                vueApp.showToast(i18n("debug_crash.toast_prompt"));
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
        "removeDownload": function (id) {
            ipcRenderer.send("remove download", id);
        },
        "downloadGame": function () {
            this.ui.onboarding.downloading = true;
            ipcRenderer.send("download game");
        },
        "launchInstall": function (install) {
            this.ui.running_install = install;
            ipcRenderer.send("launch install", install.folderName);
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
        "importGame": function () {
            ipcRenderer.send("import game");
        },
        "importMod": function () {
            ipcRenderer.send("import mod");
            this.ui.side_sheets.install = false;
        },
        "cancelDownload": function (id) {
            ipcRenderer.send("cancel download", id);
        },
        "showInstallDialog": function () {
            this.ui.install_creation.folder_name = "";
            this.ui.install_creation.install_name = "";
            this.ui.install_creation.global_save = false;
            this.ui.modals.create_install = true;
        },
        "openFolder": function (folder) {
            shell.openItem(folder);
        },
        "saveThemeConfig": function () {
            ipcRenderer.send("save theme", vueApp.ui.theme);
        },
        "testInference": function (mod) {
            ipcRenderer.send("test inference", mod);
        },
        "submitFeedback": function () {
            if (this.ui.feedback.body.length < 10) {
                this.showToast(i18n("feedback.toast_too_short"));
                return;
            }
            ipcRenderer.send("submit feedback", this.ui.feedback);
            this.ui.feedback.type = "question";
            this.ui.feedback.body = "";
            this.ui.feedback.contact = "";
            this.ui.side_sheets.feedback = false;
        },
        "downloadMod": function (url) {
            window.location.href = url;
        },
        "createShortcut": function (installDir, installName) {
            ipcRenderer.send("create shortcut", {installDir, installName});
        },
        "renameInstall": function (name) {
            if (name.trim().length < 1) {
                return;
            }
            ipcRenderer.send("rename install", {
                install: this.ui.selected_install,
                name
            });
            this.selectedInstall.installName = name;
            this.ui.new_install_name = "";
        }
    },
    "computed": {
        "selectedInstall": function () {
            const context = this.ui;
            const {selected_install, running_install} = context;
            if (selected_install) {
                return this.installs.find(install => install.folderName === selected_install);
            } if (running_install) {
                return running_install;
            } else {
                return {
                    "name": "Doki Doki Literature Club!",
                    "filename": null,
                    "directory": "ddlc"
                }
            }
        },
        "filteredInstalls": function () {
            if (!installListSearch || !this.ui.search.installs) {
                return this.installs;
            } else {
                return installListSearch.search(this.ui.search.installs);
            }
        },
        "filteredMods": function () {
            if (!modListSearch || !this.ui.search.mods) {
                return this.mods;
            } else {
                return modListSearch.search(this.ui.search.mods).map(mod => this.mods[mod]);
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

ipcRenderer.on("show onboarding", (_, show) => {
    vueApp.ui.side_sheets.onboarding = show;
});


ipcRenderer.on("running cover", (_, show) => {
    vueApp.ui.running_cover = show;
});

ipcRenderer.on("install list", (_, list) => {
    vueApp.installs = list;
    installListSearch = new Fuse(list, {
        "shouldSort": true,
        "keys": [
            "installName"
        ],
        "threshold": 0.4
    });
});

ipcRenderer.on("mod list", (_, list) => {
    vueApp.mods = list;
    modListSearch = new Fuse(list, {
        "shouldSort": true,
        "threshold": 0.4
    });
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

ipcRenderer.on("set theme", (_, theme) => {
    vueApp.ui.theme = theme;
});

ipcRenderer.on("inference result", (_, inference) => {
    vueApp.ui.inference = inference
});

ipcRenderer.on("download progress", (_, progress) => {
    vueApp.download = progress;
});

// debug keybind
Mousetrap.bind("j u s t m o n i k a", () => {
    ipcRenderer.send("enable debug");
});

firebase.database().ref("/global/banner").on("value", response => {
    vueApp.ui.banner = response.val();
    if (localStorage.getItem("last_banner") === vueApp.ui.banner.message) {
        vueApp.ui.banner.active = false;
    }
});

firebase.database().ref("/global/recommended_mods").once("value").then(response => {
    vueApp.recommended_mods = response.val();
});

document.body.ondragover = function (e) {
    e.preventDefault();
};

document.body.ondrop = function (e) {
    e.preventDefault();
    if (["application/zip", "application/x-zip-compressed"].indexOf(e.dataTransfer.items[0].getAsFile().type) !== -1 || e.dataTransfer.items[0].getAsFile().path.endsWith(".zip")) {
        ipcRenderer.send("import mod dropped", e.dataTransfer.items[0].getAsFile().path);
    } else {
        vueApp.showToast(i18n("mod_import.toast_invalid", e.dataTransfer.items[0].getAsFile().name));
    }
};