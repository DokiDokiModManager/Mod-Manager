const app = new Vue({
    "el": "#app",
    "data": {
        "system_platform": ddmm.platform,
        "tab": "mods",
        "tabs": [
            {"id": "mods", "name": ddmm.translate("renderer.tabs.tab_mods"), "component": "ddmm-mods-tab"},
            {"id": "store", "name": ddmm.translate("renderer.tabs.tab_store"), "component": "ddmm-store-tab"},
            {"id": "settings", "name": ddmm.translate("renderer.tabs.tab_settings"), "component": "ddmm-settings-tab"},
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