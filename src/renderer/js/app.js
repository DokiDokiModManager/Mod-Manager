const app = new Vue({
    "el": "#app",
    "data": {
        "tab": "home",
        "tabs": {
            "home": {"name": "Home", "icon": "home", "component": "ddmm-home-tab"},
            "mods": {"name": "Mods", "icon": "list"},
            "sayonika": {"name": "Sayonika", "icon": "download"},
            "settings": {"name": "Settings", "icon": "cog"},
            "about": {"name": "About", "icon": "info"}
        }
    },
    "methods": {
        "switchTab": function (tab) {
            console.log("Switching to tab: " + tab);
            this.tab = tab;
        }
    }
});