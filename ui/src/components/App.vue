<template>
    <div :class="'os-'+system_platform" :key="rerenderKey">
        <div class="app-container-background">
            <div class="gradient"></div>
            <img alt="" :src="backgroundImage" :class="{'visible': !showBackground}">
            <img alt="" :src="backgroundOverride1" :class="{'visible': showBackground && !showBackground2}">
            <img alt="" :src="backgroundOverride2" :class="{'visible': showBackground && showBackground2}">
        </div>

        <div class="app app-container-contents">
            <Titlebar :app_name="app_name" :app_version="app_version" :system_borders="system_borders"></Titlebar>

            <NewsBanner v-if="bannerVisisble && !onboarding"></NewsBanner>

            <Dialogs></Dialogs>

            <OnboardingOverlay v-if="onboarding" @close="onboarding = false"></OnboardingOverlay>

            <template v-else>
                <component :is="tab"></component>

                <Navbar :tabs="tabs"></Navbar>
            </template>
        </div>
    </div>
</template>

<script>

    import Titlebar from "./Titlebar.vue";
    import Navbar from "./Navbar.vue";
    import ModsTab from "./tabs/ModsTab.vue";
    import OptionsTab from "./tabs/OptionsTab.vue";
    import ExperimentsTab from "./tabs/ExperimentsTab";
    import AboutTab from "./tabs/AboutTab.vue";
    import Dialogs from "./Dialogs.vue";
    import OnboardingOverlay from "./OnboardingOverlay";
    import DownloadsTab from "./tabs/DownloadsTab";
    import NewsBanner from "./NewsBanner";
    import backgrounds from "../js/utils/backgrounds";

    export default {
        name: "App",
        components: {
            NewsBanner,
            OnboardingOverlay,
            Navbar,
            Titlebar,
            ModsTab,
            OptionsTab,
            Dialogs,
            AboutTab,
            ExperimentsTab,
            DownloadsTab
        },
        data() {
            return {
                // app / system meta
                app_name: "Doki Doki Mod Manager",
                app_version: ddmm.version,
                system_platform: ddmm.platform,

                onboarding: false,

                // config
                system_borders: ddmm.config.readConfigValue("systemBorders"),

                // tabs
                tabs: [
                    {
                        name: ddmm.translate.bind(null, "renderer.tabs.tab_play"),
                        component: "ModsTab"
                    },
                    {
                        name: ddmm.translate.bind(null, "renderer.tabs.tab_downloads"),
                        component: "DownloadsTab",
                        badge: () => {
                            return this.$store.state.downloads.length > 0;
                        }
                    },
                    {
                        name: ddmm.translate.bind(null, "renderer.tabs.tab_options"),
                        component: "OptionsTab",
                        badge: () => {
                            return this.$store.state.update === "available";
                        }
                    },
                    {
                        name: ddmm.translate.bind(null, "renderer.tabs.tab_about"),
                        component: "AboutTab"
                    },
                    {
                        name: () => ddmm.env.DDMM_DEVELOPER ? "Experiments" : "",
                        component: "ExperimentsTab"
                    }
                ],
            }
        },
        computed: {
            rerenderKey() {
                return this.$store.state.rerender_key;
            },

            tab() {
                return this.$store.state.tab;
            },

            backgroundImage() {
                const bg = this.$store.state.background;
                let imagePath;
                if (bg.startsWith("custom:")) {
                    // imagePath = ddmm.fileToURL(bg.split("custom:")[1]);
                } else {
                    imagePath = backgrounds[bg];
                }
                console.log(imagePath);
                return imagePath;
            },

            backgroundOverride1() {
                return this.$store.state.custom_background.src_1;
            },

            backgroundOverride2() {
                return this.$store.state.custom_background.src_2;
            },

            showBackground() {
                return this.$store.state.custom_background.display;
            },

            showBackground2() {
                return this.$store.state.custom_background.display_2;
            },

            bannerVisisble() {
                return this.$store.state.news_banner.display;
            }
        },
        mounted() {
            // ddmm.on("start onboarding", () => {
            //     this.onboarding = true;
            // });
            //
            // ddmm.on("onboarding downloaded", () => {
            //     this.onboarding = false;
            // });
        }
    }
</script>

