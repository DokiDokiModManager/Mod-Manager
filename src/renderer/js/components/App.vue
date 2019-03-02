<template>
    <div
            :class="['app', 'os-'+system_platform]"
            :style="{'background-image': backgroundImageStyle}">
        <Titlebar :app_name="app_name" :app_version="app_version" :system_borders="system_borders"/>
        <component
                :is="tab"
        ></component>
        <Navbar :tabs="tabs" @tab="setTab"></Navbar>
    </div>
</template>

<script>
    import Titlebar from "./Titlebar.vue";
    import Navbar from "./Navbar.vue";
    import ModsTab from "./tabs/ModsTab.vue";

    export default {
        name: "App",
        components: {Navbar, Titlebar, ModsTab},
        data: function () {
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
                        component: "ddmm-store-placeholder-tab"
                    },
                    {
                        id: "options",
                        name: ddmm.translate("renderer.tabs.tab_options"),
                        component: "ddmm-options-tab"},
                    {
                        id: "about",
                        name: ddmm.translate("renderer.tabs.tab_about"),
                        component: "ddmm-about-tab"}
                ]
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
            }
        }
    }
</script>

