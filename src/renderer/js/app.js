const app = new Vue({
    "el": "#app",
    "data": {
        "background_image": ddmm.config.readConfigValue("background"),
        "app_name": "Doki Doki Mod Manager",
        "app_version": ddmm.version,
        "system_platform": ddmm.platform,
        "app_updating": false,
        "tab": "mods",
        "tabs": [
            {"id": "mods", "name": ddmm.translate("renderer.tabs.tab_mods"), "component": "ddmm-mods-tab"},
            {"id": "store", "name": ddmm.translate("renderer.tabs.tab_store"), "component": "ddmm-store-tab"},
            {"id": "options", "name": ddmm.translate("renderer.tabs.tab_options"), "component": "ddmm-options-tab"},
            {"id": "about", "name": ddmm.translate("renderer.tabs.tab_about"), "component": "ddmm-about-tab"}
        ],
        "running_cover": {
            "display": false,
            "title": "",
            "description": "",
            "dismissable": false
        },
        "crash_cover": {
            "display": false,
            "title": "",
            "description": "",
            "fatal": false
        }
    },
    "computed": {
        "currentTabComponent": function () {
            return this.tabs.find(t => t.id === this.tab).component;
        },
        "backgroundImageStyle": function () {
            if (this.background_image && this.background_image !== "none") {
                return "radial-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.99) 90%), url(../images/backgrounds/" + this.background_image + ")";
            } else {
                return "none";
            }
        },
        "backgroundImageCrashStyle": function () {
            if (this.background_image && this.background_image !== "none") {
                return "radial-gradient(rgba(64, 0, 0, 0.5), rgba(64, 0, 0, 0.99) 90%), url(../images/backgrounds/" + this.background_image + ")";
            } else {
                return "none";
            }
        }
    },
    "methods": {
        "_": ddmm.translate,
        "windowMaximise": ddmm.window.maximise,
        "windowClose": ddmm.window.close,
        "windowMinimise": ddmm.window.minimise,
        "setBackground": function (image) {
            this.background_image = image;
        }
    }
});

if (ddmm.env.DDMM_INCOGNITO) {
    app.app_name = "App Name";
}

ddmm.on("running cover", cover => {
    console.dir(cover);
    app.running_cover.display = cover.display;
    app.running_cover.title = cover.title;
    app.running_cover.description = cover.description;
    app.running_cover.dismissable = cover.dismissable;
});

ddmm.on("error", error => {
    console.log(error);
    app.crash_cover.display = true;
    app.crash_cover.title = error.title;
    app.crash_cover.description = error.body;
    app.crash_cover.fatal = error.fatal;
});