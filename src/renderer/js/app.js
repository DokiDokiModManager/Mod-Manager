if (!localStorage.getItem("last_tab")) {
    localStorage.setItem("last_tab", "home");
}

const CHANGELOG_DATA_REGEX = /({[^]+})/gm;

function parseChangelogData(postBody) {
    const matches = CHANGELOG_DATA_REGEX.exec(postBody);
    if (matches && matches[1]) {
        try {
            return JSON.parse(matches[1]);
        } catch (e) {
            return null;
        }
    } else {
        return null;
    }
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
            "sayonika": {"name": "Sayonika", "icon": "download", "component": "ddmm-sayonika-tab"},
            "settings": {"name": "Settings", "icon": "cog"},
            "about": {"name": "About", "icon": "info", "component": "ddmm-about-tab"}
        },
        "recommended_mods": {},
        "banner": {},
        "ddmm_version": ddmm.version,
        "mod_list": [],
        "install_list": [],
        "running_cover": {"display": false, "dismissable": false, "title": "", "description": ""},
        "drop_cover": false,
        "changelog": [],
        "modals": {
            "changelog": false
        }
    },
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        },
        "switchTab": function (tab) {
            localStorage.setItem("last_tab", tab);
            this.tab = tab;
        },
        "showModal": function (modal) {
            this.modals[modal] = true;
        }
    }
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

// load changelog TODO: replace with actual repo
fetch("https://api.github.com/repos/ZudoMC/test-repo/releases").then(r => r.json()).then(releases => {
    app.changelog = releases.map(release => {
        return {
            "name": release.name,
            "details": parseChangelogData(release.body)
        }
    });
});

// load mod / install list on first load
ddmm.refreshModList();
ddmm.refreshInstallList();