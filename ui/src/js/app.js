import Logger from "./utils/Logger";

import Vue from "vue";
import Vuex from "vuex";
import App from "../components/App.vue";

import * as Sentry from "@sentry/browser";
// import * as Integrations from "@sentry/integrations";
import DDLCModClub from "./stores/DDLCModClub";
import UpdateChecker from "./utils/UpdateChecker";

// Sentry.init({
//     dsn: "https://bf0edf3f287344d4969e3171c33af4ea@sentry.io/1297252",
//     integrations: [new Integrations.Vue({Vue, attachProps: true})]
// });

Vue.use(Vuex);

window.__DDMM_SENTRY__ = Sentry;

// noinspection JSValidateTypes
const store = new Vuex.Store({
    state: {
        custom_background: {
            src_1: null,
            src_2: null,
            display_2: false,
            display: false
        },

        tab: "ModsTab",

        background: ddmm.config.readConfigValue("background"),

        game_data: {
            installs: [],
            mods: []
        },

        modals: {
            login: false,
            install_options: false,
            mod_options: false,
            install_rename: false,
            uninstall: false,
            save_delete: false,
            install_archive: false,
            install_unarchive: false,
            unarchiving: false,
            installing: false,
            game_running: false,
            error: false,
            install_category: false,
            news: false,
            mod_preview: false,
            mod_delete: false,
            issue_report: false,
            language_switch: false,
            install_fail: false,
            download_starting: false
        },

        preloaded_install_folder: "",

        selected_install: {},
        selected_mod: "",

        install_list_selection: {
            type: "install",
            id: ddmm.config.readConfigValue("lastLaunchedInstall")
        },

        error: {
            fatal: false,
            stacktrace: ""
        },

        news_modal: {
            title: "",
            body: ""
        },

        news_banner: {
            display: false,
            body: "",
            id: ""
        },

        running_install_path: null,

        rerender_key: Math.random(),

        downloads: [],

        mod_preview: {},

        install_creation_data: {
            install_name: "",
            folder_name: "",
            mod: "",
            save_option: 0
        },

        update: "none"
    },
    mutations: {
        load_installs(state, payload) {
            state.game_data.installs = payload;
        },
        load_mods(state, payload) {
            state.game_data.mods = payload;
        },
        show_modal(state, payload) {
            if (state.modals.hasOwnProperty(payload.modal)) {
                state.modals[payload.modal] = true;
            } else {
                Logger.error("Modal", "Attempted to show modal that doesn't exist: " + payload.modal)
            }
        },
        hide_modal(state, payload) {
            if (state.modals.hasOwnProperty(payload.modal)) {
                state.modals[payload.modal] = false;
            } else {
                Logger.error("Modal", "Attempted to hide modal that doesn't exist: " + payload.modal)
            }
        },
        select_install(state, payload) {
            Logger.info("InstallOpts", "Selected install " + payload.install.folderName);
            state.selected_install = payload.install;
        },
        select_mod(state, payload) {
            Logger.info("ModOpts", "Selected mod " + payload.mod);
            state.selected_mod = payload.mod
        },
        set_background(state, background) {
            ddmm.config.saveConfigValue("background", background);
            state.background = background;
        },
        override_background(state, background) {
            if (!ddmm.config.readConfigValue("modBackgrounds")) return;

            if (background) {
                Logger.info("BG", "Displaying custom background");
                state.custom_background.display = true;
                state.custom_background.display_2 = !state.custom_background.display_2;
                if (state.custom_background.display_2) {
                    state.custom_background.src_2 = background;
                } else {
                    state.custom_background.src_1 = background;
                }

            } else {
                Logger.info("BG", "Hiding custom background");
                state.custom_background.display = false;
            }
        },
        installation_status(state, payload) {
            state.modals.installing = !!payload.installing;
            state.preloaded_install_folder = payload.preloaded_install_folder;
        },
        install_list_selection(state, payload) {
            state.install_list_selection = payload;
        },
        set_running_install(state, payload) {
            state.running_install_path = payload;
        },
        error(state, payload) {
            state.error.fatal = payload.fatal;
            state.error.stacktrace = payload.stacktrace;
        },
        show_news(state, payload) {
            switch (payload.style) {
                case "popup":
                    state.news_modal.title = payload.title;
                    state.news_modal.body = payload.body;
                    state.modals.news = true;
                    break;
                case "banner":
                    state.news_banner.body = payload.body;
                    state.news_banner.id = payload.id;
                    state.news_banner.display = true;
                    break;
            }
        },
        hide_banner(state) {
            state.news_banner.display = false;
        },
        rerender(state) {
            state.rerender_key = Math.random();
        },
        set_tab(state, payload) {
            state.tab = payload;
        },
        set_downloads(state, payload) {
            state.downloads = payload;
        },
        preview_mod(state, payload) {
            state.mod_preview = payload;
            state.modals.mod_preview = true;
        },
        set_install_creation(state, payload) {
            Object.assign(state.install_creation_data, payload);
        },
        set_update_status(state, payload) {
            state.update = payload;
        }
    },
    actions: {
        install_mod(context, payload) {
            context.commit("set_tab", "ModsTab");
            context.commit("set_install_creation", {
                mod_selection: payload.custom ? "!custom" : payload.mod,
                mod: payload.mod
            });
            context.commit("install_list_selection", {
                type: "create"
            });
        }
    },
    strict: ddmm.env.NODE_ENV !== 'production'
});

Object.assign(App, {
    store
});

new Vue(App).$mount("#app-mount");

function getInstalls() {
    ddmm.install.getList().then(installs => {
        Logger.info("Install List", "Got a list of " + installs.length + " installs");
        store.commit("load_installs", installs);
        if (store.state.preloaded_install_folder) {
            store.commit("install_list_selection", {
                type: "install",
                id: store.state.preloaded_install_folder
            });
        } else {
            if (store.state.install_list_selection.type === "install") {
                if (!installs.find(install => install.folderName === store.state.install_list_selection.id)) {
                    store.commit("install_list_selection", {
                        type: "create"
                    });
                }
            }
        }
        store.commit("installation_status", {installing: false, preloaded_install_folder: ""});
    });
}

getInstalls();

// ddmm.on("mod list", mods => {
//     Logger.info("Mod List", "Got a list of " + mods.length + " mods");
//     store.commit("load_mods", mods);
// });
//
// ddmm.on("running cover", cover => {
//     Logger.info("Game Running", cover.display ? "Install running from " + cover.folder_path : "Game ended");
//     store.commit("hide_modal", {modal: "unarchiving"});
//     if (cover.display) {
//         store.commit("set_running_install", cover.folder_path);
//         store.commit("show_modal", {modal: "game_running"});
//     } else {
//         store.commit("hide_modal", {modal: "game_running"});
//     }
// });
//
// ddmm.on("error", error => {
//     Logger.error("Main Error", "An error occurred in the main process (fatal = " + error.fatal + ")\n\n" + error.stacktrace);
//     store.commit("show_modal", {modal: "error"});
//     store.commit("error", error);
// });
//
// ddmm.on("got downloads", downloads => {
//     store.commit("set_downloads", downloads);
// });
//
// ddmm.on("download started", () => {
//     store.commit("hide_modal", {modal: "download_starting"});
// });
//
// ddmm.on("languages reloaded", () => {
//     store.commit("hide_modal", {modal: "language_switch"});
//     store.commit("rerender");
// });
//
// ddmm.on("update status", status => {
//     store.commit("set_update_status", status);
// });
//
// ddmm.on("show install fail warning", folderName => {
//     store.commit("show_modal", {modal: "install_fail"});
// });

const NEWS_URL = "https://raw.githubusercontent.com/DokiDokiModManager/Meta/master/news.json";

if (!ddmm.constants.news_disabled) {
    fetch(NEWS_URL).then(res => res.json()).then(news => {
        let seenNews = [];

        if (localStorage.getItem("seen_news")) {
            seenNews = localStorage.getItem("seen_news").split(",");
        }

        news.news.forEach(article => {
            if (seenNews.indexOf(article.id) === -1) {
                store.commit("show_news", article);
                if (article.style === "popup") {
                    seenNews.push(article.id);
                    localStorage.setItem("seen_news", seenNews.join(","));
                }
            }
        });
    });
}

if (!ddmm.constants.auto_update_disabled) {
    UpdateChecker.getLatest(store);
}

window.test = new DDLCModClub();
