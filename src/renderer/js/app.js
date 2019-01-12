const app = new Vue({
    "el": "#app",
    "data": {
        "onboarding": false,
        "background_image": ddmm.config.readConfigValue("background"),
        "app_name": "Doki Doki Mod Manager",
        "app_version": ddmm.version,
        "system_platform": ddmm.platform,
        "app_updating": false,
        "tab": "mods",
        "system_borders": ddmm.config.readConfigValue("systemBorders"),
        "tabs": [
            {"id": "mods", "name": ddmm.translate("renderer.tabs.tab_mods"), "component": "ddmm-mods-tab"},
            // {"id": "store", "name": ddmm.translate("renderer.tabs.tab_store"), "component": "ddmm-store-tab"},
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
            "fatal": false,
            "stacktrace": ""
        },
        "prompt_cover": {
            "display": false,
            "title": "",
            "description": "",
            "button_affirmative": "",
            "button_negative": "",
            "callback": null
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
                return "linear-gradient(#111, #111)";
            }
        },
        "backgroundImageCrashStyle": function () {
            if (this.background_image && this.background_image !== "none") {
                return "radial-gradient(rgba(64, 0, 0, 0.5), rgba(64, 0, 0, 0.99) 90%), url(../images/backgrounds/" + this.background_image + ")";
            } else {
                return "linear-gradient(rgb(64, 0, 0), rgb(64, 0, 0))";
            }
        }
    },
    "methods": {
        "_": ddmm.translate,
        "windowMaximise": ddmm.window.maximise,
        "windowClose": ddmm.window.close,
        "windowMinimise": ddmm.window.minimise,
        "openURL": ddmm.app.openURL,
        "setBackground": function (image) {
            this.background_image = image;
        },
        "closePrompt": function (yes) {
            this.prompt_cover.callback(!!yes);
            this.prompt_cover.display = false;
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
    app.crash_cover.stacktrace = error.stacktrace;
});

ddmm.on("updating", is => {
    app.app_updating = is;
});

ddmm.on("prompt", data => {
    app.prompt_cover.display = true;
    app.prompt_cover.title = data.title;
    app.prompt_cover.description = data.description;
    app.prompt_cover.button_negative = data.button_negative;
    app.prompt_cover.button_affirmative = data.button_affirmative;
    app.prompt_cover.callback = data.callback;
});

ddmm.on("start onboarding", () => {
    app.onboarding = true;
});