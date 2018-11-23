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
            "mods": {"name": "Mods", "icon": "list", "component": "ddmm-mods-tab"},
            "sayonika": {"name": "Sayonika", "icon": "download"},
            "settings": {"name": "Settings", "icon": "cog"},
            "about": {"name": "About", "icon": "info", "component": "ddmm-about-tab"}
        },
        "recommended_mods": {},
        "banner": {},
        "ddmm_version": ddmm.version,
        "mod_list": [],
        "install_list": [],
        "running_cover": {"display": false, "dismissable": false, "title": "", "description": ""},
        "drop_cover": false
    },
    "methods": {
        "switchTab": function (tab) {
            localStorage.setItem("last_tab", tab);
            this.tab = tab;
        }
    }
});

// load recommended mods
firebase.database().ref("/global/recommended_mods").once("value").then(response => {
    app.recommended_mods = response.val();
});

// load announcement banner
firebase.database().ref("/global/banner").once("value").then(response => {
    app.banner = response.val();
});

// update mod list
ddmm.on("mod list", mods => {
    console.log("Received " + mods.length + " mods.");
    app.mod_list = mods;
});

// update install list
ddmm.on("install list", installs => {
    console.log("Received " + installs.length + " installs.");
    app.install_list = installs;
});

// show / hide running cover
ddmm.on("running cover", data => {
    app.running_cover = data;
});

// load mod / install list on first load
ddmm.refreshModList();
ddmm.refreshInstallList();