const app = new Vue({
    "el": "#app",
    "data": {
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
        ]
    },
    "computed": {
        "currentTabComponent": function () {
            return this.tabs.find(t => t.id === this.tab).component;
        }
    },
    "methods": {
        "_": ddmm.translate,
        "windowMaximise": ddmm.window.maximise,
        "windowClose": ddmm.window.close,
        "windowMinimise": ddmm.window.minimise
    }
});

if (ddmm.env.DDMM_INCOGNITO) {
    app.app_name = "App Name";
    document.querySelector("#app").style.backgroundImage = "none";
}