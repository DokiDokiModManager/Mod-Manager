import * as firebase from "firebase/app";
import "firebase/firebase-auth";
import "firebase/firebase-database";
import "firebase/firebase-storage";

firebase.initializeApp({
    apiKey: "AIzaSyDInikDCCVFIhpAMPEBaaRmx_p2ZLX-6GY",
    authDomain: "doki-doki-mod-manager.firebaseapp.com",
    databaseURL: "https://doki-doki-mod-manager.firebaseio.com",
    projectId: "doki-doki-mod-manager",
    storageBucket: "doki-doki-mod-manager.appspot.com",
    messagingSenderId: "324232265869"
});

import Logger from "./utils/Logger";

import Vue from "vue";
import Vuex from "vuex";
import App from "./components/App.vue";

Vue.use(Vuex);

// noinspection JSValidateTypes
const store = new Vuex.Store({
    state: {
        options: {
            background: ddmm.config.readConfigValue("background"),
            system_borders: ddmm.config.readConfigValue("systemBorders"),
            sdk_mode: ddmm.config.readConfigValue("sdkMode"),
            discord: ddmm.config.readConfigValue("discordEnabled"),
            language: ddmm.config.readConfigValue("language")
        },
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
            account_settings: false,
            account_username: false,
            password_reset_confirmation: false,
            cloudsave_conflict: true
        },
        user: {
            logged_in: false,
            display_name: "",
            email: "",
            email_verified: false,
            donated: false
        },
        selected_install: {},
        selected_mod: ""
    },
    mutations: {
        options(state, payload) {
            Logger.info("Options", "Updated options: " + JSON.stringify(payload));

            if (payload.hasOwnProperty("background")) {
                ddmm.config.saveConfigValue("background", payload.background);
                state.options.background = payload.background;
            }

            if (payload.hasOwnProperty("system_borders")) {
                ddmm.config.saveConfigValue("systemBorders", payload.system_borders);
                state.options.system_borders = payload.system_borders;
            }

            if (payload.hasOwnProperty("sdk_mode")) {
                ddmm.config.saveConfigValue("sdkMode", payload.sdk_mode);
                state.options.sdk_mode = payload.sdk_mode;
            }

            if (payload.hasOwnProperty("discord")) {
                ddmm.config.saveConfigValue("discordEnabled", payload.discord);
                state.options.discord = payload.discord;
            }

            if (payload.hasOwnProperty("language")) {
                ddmm.config.saveConfigValue("language", payload.language);
                state.options.language = payload.language;
            }
        },
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
        login(state, payload) {
            if (payload.email) {
                Logger.info("Firebase", "User logged in: " + payload.email);
            } else {
                Logger.info("Firebase", "User state updated");
            }
            state.user.logged_in = true;
            if (payload.hasOwnProperty("display_name")) {
                state.user.display_name = payload.display_name;
            }
            if (payload.hasOwnProperty("email")) {
                state.user.email = payload.email;
            }
            if (payload.hasOwnProperty("donated")) {
                state.user.donated = payload.donated;
            }
        },
        logout(state) {
            Logger.info("Firebase", "User logged out");
            state.user.logged_in = false;
            state.user.displayName = "";
            state.user.email = "";
            state.user.donated = false;
        },
        select_install(state, payload) {
            Logger.info("InstallOpts", "Selected install " + payload.install.folderName);
            state.selected_install = payload.install;
        },
        select_mod(state, payload) {
            Logger.info("ModOpts", "Selected mod " + payload.mod);
            state.selected_mod = payload.mod
        }
    },
    strict: ddmm.env.NODE_ENV !== 'production'
});

// hacky way to enable Vuex injection without using runtime compiled templates
// this way i get to keep my CSP
// <3
Object.assign(App, {
    store
});

new Vue(App).$mount("#app-mount").$nextTick(() => {
    ddmm.mods.refreshInstallList();
    ddmm.mods.refreshModList();
});

ddmm.on("install list", installs => {
    Logger.info("Install List", "Got a list of " + installs.length + " installs");
    store.commit("load_installs", installs);
});

ddmm.on("mod list", mods => {
    Logger.info("Mod List", "Got a list of " + mods.length + " mods");
    store.commit("load_mods", mods);
});

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        user.getIdTokenResult(true).then(result => {
            store.commit("login", {
                display_name: user.displayName,
                email: user.email,
                email_verified: user.emailVerified,
                donated: !!result.claims.donated
            });
        });
    } else {
        store.commit("logout");
    }
});

window.__ddmm_state = store;