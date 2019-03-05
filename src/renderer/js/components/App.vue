<template>
    <div
            :class="['app', 'os-'+system_platform]"
            :style="{'background-image': backgroundImageStyle}">
        <Titlebar :app_name="app_name" :app_version="app_version" :system_borders="system_borders"/>
        <component
                :is="tab"
                :installs="installs"
                :mods="mods"
                :installs_search="installs_search"
                :mods_search="mods_search"
        ></component>
        <Navbar :tabs="tabs" @tab="setTab"></Navbar>
    </div>
</template>

<script>
    import * as Fuse from "fuse.js";

    import Titlebar from "./Titlebar.vue";
    import Navbar from "./Navbar.vue";
    import ModsTab from "./tabs/ModsTab.vue";
    import OptionsTab from "./tabs/OptionsTab.vue";

    export default {
        name: "App",
        components: {Navbar, Titlebar, ModsTab, OptionsTab},
        data () {
            return {
                // app / system meta
                app_name: "Doki Doki Mod Manager",
                app_version: ddmm.version,
                system_platform: ddmm.platform,

                // config
                background_image: ddmm.config.readConfigValue("background"),
                system_borders: ddmm.config.readConfigValue("systemBorders"),

                // tabs
                tab: "ModsTab",
                tabs: [
                    {
                        id: "mods",
                        name: ddmm.translate("renderer.tabs.tab_mods"),
                        component: "ModsTab"
                    },
                    {
                        id: "store",
                        name: ddmm.translate("renderer.tabs.tab_store"),
                        component: ""
                    },
                    {
                        id: "options",
                        name: ddmm.translate("renderer.tabs.tab_options"),
                        component: "OptionsTab"
                    },
                    {
                        id: "about",
                        name: ddmm.translate("renderer.tabs.tab_about"),
                        component: ""
                    }
                ],

                // mod and installs
                installs: [],
                mods: [],
                installs_search: null,
                mods_search: null
            }
        },
        computed: {
            backgroundImageStyle: function () {
                if (this.background_image && this.background_image !== "none") {
                    return "radial-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.99) 90%), url(../../../src/renderer/images/backgrounds/" + this.background_image + ")";
                } else {
                    return "linear-gradient(#111, #111)";
                }
            }
        },
        methods: {
            setTab: function (tab) {
                this.tab = tab.component;
            },
            _refreshInstalls: function (installs) {
                this.installs = installs;
                this.installs_search = new Fuse(installs, {
                    shouldSort: true,
                    threshold: 0.5,
                    keys: ["name", "folderName", "mod.name"]
                });
            },
            _refreshMods: function (mods) {
                this.mods = mods;
                this.mods_search = new Fuse(mods, {
                    shouldSort: true,
                    threshold: 0.5,
                    keys: ["filename"]
                });
            }
        },
        mounted () {
            ddmm.on("install list", this._refreshInstalls);
            ddmm.on("mod list", this._refreshMods);
            ddmm.mods.refreshInstallList();
            ddmm.mods.refreshModList();
        },
        destroyed() {
            ddmm.off("install list", this._refreshInstalls);
            ddmm.off("mod list", this._refreshMods);
        }
    }
</script>

