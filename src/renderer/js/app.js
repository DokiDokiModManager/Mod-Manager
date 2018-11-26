
const CHANGELOG_DATA_REGEX = /({[^]+})/gm;

const PURIST_ENABLED = ddmm.readConfigValue("puristMode");

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
        "tab": (PURIST_ENABLED ? "mods" : "home"),
        "tabs": {
            "home": {"name": "Home", "icon": "home", "component": "ddmm-home-tab", "purist_enabled": false},
            "mods": {"name": "Mods", "icon": "list", "component": "ddmm-mods-tab", "purist_enabled": true},
            "sayonika": {"name": "Sayonika", "icon": "download", "component": "ddmm-sayonika-tab", "purist_enabled": false},
            "settings": {"name": "Settings", "icon": "cog", "component": "ddmm-settings-tab", "purist_enabled": true},
            "about": {"name": "About", "icon": "info", "component": "ddmm-about-tab", "purist_enabled": true}
        },
        "recommended_mods": {},
        "banner": {},
        "ddmm_version": ddmm.version,
        "mod_list": [],
        "install_list": [],
        "running_cover": {"display": false, "dismissable": false, "title": "", "description": ""},
        "drop_cover": false,
        "changelog": [],
        "purist": PURIST_ENABLED,
        "modals": {
            "changelog": false,
            "install": {
                "visible": false,
                "install_name": "",
                "folder_name": "",
                "global_save": false,
                "mod": null
            }
        }
    },
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        },
        "switchTab": function (tab) {
            this.tab = tab;
        },
        "showModal": function (modal) {
            this.modals[modal] = true;
        },
        "showInstallDialog": function (path) {
            this.modals.install.visible = true;
            this.modals.install.mod = path;
        },
        "generateInstallFolderName": function () {
            this.modals.install.folder_name = this.modals.install.install_name
                .trim()
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/-+/g, "-");
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