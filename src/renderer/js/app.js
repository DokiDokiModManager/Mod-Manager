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
        ui_preferences: {
            background: ddmm.config.readConfigValue("background"),
            system_borders: ddmm.config.readConfigValue("systemBorders")
        },
        game_data: {
            installs: [],
            mods: []
        }
    },
    mutations: {
        ui_preferences(state, payload) {
            Logger.info("UI Preferences", "Updated UI preferences: " + JSON.stringify(payload));

            if (payload.hasOwnProperty("background")) {
                ddmm.config.saveConfigValue("background", payload.background);
                state.ui_preferences.background = payload.background;
            }

            if (payload.hasOwnProperty("system_borders")) {
                ddmm.config.saveConfigValue("systemBorders", payload.system_borders);
                state.ui_preferences.system_borders = payload.system_borders;
            }
        },
        load_installs(state, payload) {
            state.installs = payload;
        },
        load_mods(state, payload) {
            state.mods = payload;
        }
    },
    strict: ddmm.env.NODE_ENV !== 'production'
});

ddmm.on("install list", installs => {
    Logger.info("Install List", "Got a list of " + installs.length + " installs");
    store.commit("load_installs", installs);
});

ddmm.on("mod list", mods => {
    Logger.info("Mod List", "Got a list of " + mods.length + " mods");
    store.commit("load_mods", mods);
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