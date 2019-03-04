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

import Vue from "vue";
import App from "./components/App.vue";

new Vue(App).$mount("#app-mount");