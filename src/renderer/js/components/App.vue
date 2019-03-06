<template>
    <div
            :class="['app', 'os-'+system_platform]"
            :style="{'background-image': backgroundImageStyle}">

        <!--<PromptDialog title="Some Dialog" placeholder="Enter something" submit_text="Submit Button" cancel_text="Cancel Button">-->
            <!--This would be a modal dialog box with an input field.-->
        <!--</PromptDialog>-->

        <ConfirmDialog title="Some Dialog" yes_text="Yes Button" no_text="No Button">
            This would be a modal dialog box with yes/no buttons.
        </ConfirmDialog>

        <Titlebar :app_name="app_name" :app_version="app_version" :system_borders="system_borders"/>
        <component :is="tab"></component>
        <Navbar :tabs="tabs" @tab="setTab"></Navbar>
    </div>
</template>

<script>

    import Titlebar from "./Titlebar.vue";
    import Navbar from "./Navbar.vue";
    import ModsTab from "./tabs/ModsTab.vue";
    import OptionsTab from "./tabs/OptionsTab.vue";
    import PromptDialog from "./dialogs/PromptDialog.vue";
    import ConfirmDialog from "./dialogs/ConfirmDialog.vue";

    export default {
        name: "App",
        components: {Navbar, Titlebar, ModsTab, OptionsTab, PromptDialog, ConfirmDialog},
        data () {
            return {
                // app / system meta
                app_name: "Doki Doki Mod Manager",
                app_version: ddmm.version,
                system_platform: ddmm.platform,

                // config
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
            }
        },
        computed: {
            backgroundImage() {
                return this.$store.state.options.background;
            },
            backgroundImageStyle() {
                if (this.backgroundImage && this.backgroundImage !== "none") {
                    return "radial-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.99) 90%), url(../../../src/renderer/images/backgrounds/" + this.backgroundImage + ")";
                } else {
                    return "linear-gradient(#111, #111)";
                }
            }
        },
        methods: {
            setTab: function (tab) {
                this.tab = tab.component;
            },
        }
    }
</script>

