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
    import BackgroundOptions from "./options/BackgroundOptions.vue";
    import Logger from "../../utils/Logger";

    export default {
        name: "OptionsTab",
        components: {BackgroundOptions},
        data() {
            return {
                selected_option: "",
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
                                id: "advanced_appearance"
                            }
                        ]
                    },
                    {
                        header: ddmm.translate("renderer.tab_options.list.header_account"),
                        contents: [
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_cloudsaves"),
                                id: "cloudsaves"
                            },
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_accmanagement"),
                                id: "accmanagement"
                            }
                        ]
                    },
                    {
                        header: ddmm.translate("renderer.tab_options.list.header_application"),
                        contents: [
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_updates"),
                                id: "updates"
                            },
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_storage"),
                                id: "storage"
                            },
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_language"),
                                id: "language"
                            }
                        ]
                    },
                    {
                        header: ddmm.translate("renderer.tab_options.list.header_enhancements"),
                        contents: [
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_sdk"),
                                id: "sdk"
                            },
                            {
                                title: ddmm.translate("renderer.tab_options.list.link_discord"),
                                id: "discord"
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
                this.selected_option = component;
            }
        }
    }
</script>

<style scoped>

</style>