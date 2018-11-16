if (!localStorage.getItem("last_tab")) {
    localStorage.setItem("last_tab", "home");
}

Vue.config.devtools = false;
Vue.config.productionTip = false;

const app = new Vue({
    "el": "#app",
    "data": {
        "tab": localStorage.getItem("last_tab"),
        "tabs": {
            "home": {"name": "Home", "icon": "home", "component": "ddmm-home-tab"},
            "mods": {"name": "Mods", "icon": "list"},
            "sayonika": {"name": "Sayonika", "icon": "download"},
            "settings": {"name": "Settings", "icon": "cog"},
            "about": {"name": "About", "icon": "info", "component": "ddmm-about-tab"}
        },
        "recommended_mods": {},
        "ddmm_version": ddmm.version
    },
    "methods": {
        "switchTab": function (tab) {
            localStorage.setItem("last_tab", tab);
            this.tab = tab;
        }
    }
});

firebase.database().ref("/global/recommended_mods").once("value").then(response => {
    app.recommended_mods = response.val();
});