<template>
    <div class="page-content">
        <div class="mod-viewer-pane">
            <div class="mod-viewer-mod-list">
                <template v-for="section in menu">
                    <div class="mod-view-mod-list-title">{{section.header}}</div>
                    <div v-for="item in section.contents" :class="{'mod-view-mod-list-entry': true, 'active': selected_option === item.component}" @click="selectOption(item.component)"><span>{{item.title}}</span></div>
                    <br>
                </template>
            </div>
            <div class="mod-viewer-mod-display">
                <component :is="selected_option"></component>
            </div>
        </div>
    </div>
</template>

<script>
    import Logger from "../../utils/Logger";

    import BackgroundOptions from "./options/BackgroundOptions.vue";
    import AdvancedAppearanceOptions from "./options/AdvancedAppearanceOptions.vue";
    import UpdateOptions from "./options/UpdateOptions.vue";
    import StorageOptions from "./options/StorageOptions.vue";
    import LanguageOptions from "./options/LanguageOptions.vue";
    import SDKOptions from "./options/SDKOptions.vue";
    import DiscordOptions from "./options/DiscordOptions.vue";

    export default {
        name: "OptionsTab",
        components: {BackgroundOptions, AdvancedAppearanceOptions, UpdateOptions, StorageOptions, LanguageOptions, SDKOptions, DiscordOptions},
        data() {
            return {
                selected_option: sessionStorage.getItem("tab_options_last_selection") ? sessionStorage.getItem("tab_options_last_selection") : "BackgroundOptions",
                menu: [
                    {
                        header: ddmm.translate("renderer.tab_options.list.header_appearance"),
                        contents: [
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_background"),
                                component: "BackgroundOptions"
                            },
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_advanced_appearance"),
                                component: "AdvancedAppearanceOptions"
                            }
                        ]
                    },
                    {
                        header: ddmm.translate("renderer.tab_options.list.header_application"),
                        contents: [
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_updates"),
                                component: "UpdateOptions"
                            },
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_storage"),
                                component: "StorageOptions"
                            },
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_language"),
                                component: "LanguageOptions"
                            }
                        ]
                    },
                    {
                        header: ddmm.translate("renderer.tab_options.list.header_enhancements"),
                        contents: [
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_sdk"),
                                component: "SDKOptions"
                            },
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_discord"),
                                component: "DiscordOptions"
                            }
                        ]
                    },
                    {
                        header: ddmm.translate("renderer.tab_options.list.header_developers"),
                        contents: [
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_testing"),
                                id: "testing"
                            },
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_debug"),
                                id: "debug"
                            }
                        ]
                    }
                ]
            }
        },
        methods: {
            selectOption(component) {
                Logger.info("Options", "Selecting options from component " + component);
                sessionStorage.setItem("tab_options_last_selection", component);
                this.selected_option = component;
            }
        }
    }
</script>

<style scoped>

</style>