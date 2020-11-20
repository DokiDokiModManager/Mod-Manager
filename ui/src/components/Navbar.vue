<template>
    <div class="navbar">
        <div class="nav-links long">
            <div v-for="t in tabs" :class="{'active': t.component === tab}" @click="setTab(t)">
                <div class="nav-link">
                    <span class="nav-link-badge" v-if="t.badge && t.badge()"></span>
                    <span class="nav-link-text">{{t.name()}}</span>
                </div>
            </div>
        </div>

        <div class="nav-links">
            <div class="nav-link" @click="issueReport" :title="_('renderer.window_controls.issue_report')">
                <i class="fas fa-bug fa-fw"></i>
            </div>

            <div class="nav-link"
                 @click="openURL('https://help.doki.space/user-guide/')"
                 :title="_('renderer.window_controls.guide')">
                <i class="fas fa-book fa-fw"></i>
            </div>

            <div class="nav-link"
                 @click="openURL('https://doki.space/discord')"
                 :title="_('renderer.window_controls.discord')">
                <i class="fab fa-discord fa-fw"></i>
            </div>

            <div class="nav-link"
                 @click="openURL('https://patreon.com/zudo')"
                 :title="_('renderer.window_controls.patreon')">
                <i class="fas fa-heart fa-fw"></i>
            </div>
        </div>
    </div>
</template>

<script>
    import Logger from "../js/utils/Logger";

    export default {
        name: "Navbar",
        props: ["tabs"],
        computed: {
            tab() {
                return this.$store.state.tab;
            }
        },
        methods: {
            _: ddmm.translate,
            openURL: ddmm.shell.openURL,
            setTab: function (t) {
                Logger.info("Navbar", "Navigated to tab " + t.component);
                if (t.component === "ExperimentsTab" && !ddmm.env.DDMM_DEVELOPER) return;
                this.$store.commit("set_tab", t.component);
            },
            issueReport() {
                this.$store.commit("show_modal", {modal: "issue_report"});
            }
        }
    }
</script>

<style scoped>

</style>
