<template>
    <div v-if="install">
        <div class="header-content">
            <h1>{{ install.name }}
                <small><a href="javascript:;" @click="openFolder(getPathToInstall(install.folderName))"
                          :title="_('renderer.tab_mods.install.description_external')"><i
                    class="fas fa-external-link-alt"></i></a>
                </small>
                <span class="tag" v-if="install.archived">{{ _("renderer.tab_mods.install.tag_archived") }}</span>
                <span class="tag" v-if="install.globalSave">{{ _("renderer.tab_mods.install.tag_global_save") }}</span>
                <span class="tag"
                      v-if="install.mod && install.mod.uses_sdk">{{ _("renderer.tab_mods.install.tag_sdk") }}</span>
            </h1>

            <div>
                <i class="fas fa-clock"></i> <strong>{{ formatTime(install.playTime) }}</strong>
                &nbsp;
                <i class="fas fa-hdd"></i> <strong>{{ formatSize(install.size) }}</strong>
            </div>

            <br>

            <p>
                <button class="success"
                        @click="launchInstall(install)"
                        v-if="install.monikaExportStatus !== 2">
                    <i class="fas fa-play fa-fw"></i>
                    {{ _("renderer.tab_mods.install.button_launch") }}
                </button>
                <button class="primary" @click="importMAS(install.folderName)" v-else>
                    <i class="fas fa-heart fa-fw"></i>
                    {{ _("renderer.tab_mods.install.button_mas_import") }}
                </button>
                <button class="secondary" @click="showOptions(install)"><i
                    class="fas fa-cog fa-fw"></i> {{ _("renderer.tab_mods.install.button_settings") }}
                </button>
            </p>

        </div>

        <div class="main-content">
            <br>

            <template v-if="install.monikaExportStatus === 1">
                <div class="mas-export-control">
                    <h3>{{ _("renderer.tab_mods.install.title_mas_export") }}</h3>
                    <p>{{ _("renderer.tab_mods.install.description_mas_export") }}</p>

                    <button class="primary" @click="exportMonika"><i class="fas fa-heart fa-fw"></i>
                        {{ _("renderer.tab_mods.install.button_mas_export") }}
                    </button>
                </div>
                <br>
            </template>

            <template v-if="install.installFailed">
                <div class="install-failed-control">
                    <h3>{{ _("renderer.tab_mods.install.title_install_failed") }}</h3>
                    <p>{{ _("renderer.tab_mods.install.description_install_failed") }}</p>
                    <br>
                    <p>
                        <Link :to="'https://help.doki.space/user-guide/reference/mod-install-troubleshooting.html'">
                            <i class="fas fa-book fa-fw"></i> {{ _("renderer.tab_mods.install.link_troubleshooting") }}
                        </Link>
                    </p>
                    <br>
                    <p>{{ _("renderer.tab_mods.install.description_install_failed_launch_again") }}</p>
                </div>
                <br>
            </template>

            <template v-if="install.singletonError">
                <div class="install-failed-control">
                    <h3>{{ _("renderer.tab_mods.install.title_singleton_error") }}</h3>
                    <p>{{ _("renderer.tab_mods.install.description_singleton_error") }}</p>
                    <br>
                    <p>
                        <Link :to="'https://help.doki.space/user-guide/reference/mod-install-troubleshooting.html'">
                            <i class="fas fa-book fa-fw"></i> {{ _("renderer.tab_mods.install.link_troubleshooting") }}
                        </Link>
                    </p>
                    <br>
                    <p>{{ _("renderer.tab_mods.install.description_install_failed_launch_again") }}</p>
                </div>
                <br>
            </template>

            <template v-if="install.mod">
                <h2>{{ install.mod.name }}</h2>
                <p><strong>{{ _("renderer.tab_mods.install.description_author", install.mod.author) }}</strong></p>
                <br>
                <p>{{ install.mod.description }}</p>

                <template v-if="install.mod.website || install.mod.discord">
                    <br>

                    <p v-if="install.mod.website"><a href="javascript:;" @click="openURL(install.mod.website)"><i
                        class="fas fa-fw fa-globe"></i> {{
                            _("renderer.tab_mods.install.link_website",
                                install.mod.website)
                        }}</a></p>
                    <p v-if="install.mod.discord"><a href="javascript:;"
                                                     @click="openURL('https://discord.gg/' + install.mod.discord)"><i
                        class="fab fa-fw fa-discord"></i> {{
                            _("renderer.tab_mods.install.link_discord",
                                "discord.gg/" +
                                install.mod.discord)
                        }}</a></p>
                </template>

                <br>
            </template>

            <h2 v-if="install.screenshots.length > 1">{{
                    _("renderer.tab_mods.install.title_screenshots",
                        install.screenshots.length)
                }}</h2>
            <h2 v-else-if="install.screenshots.length === 1">
                {{ _("renderer.tab_mods.install.title_screenshots_one") }}</h2>
            <h2 v-else>{{ _("renderer.tab_mods.install.title_screenshots_none") }}</h2>
            <p>{{ _("renderer.tab_mods.install.description_screenshots") }}</p>

            <br>
            <div class="screenshots" v-if="install.screenshots.length > 0">

                <Screenshot v-for="img in install.screenshots" :alt="img"
                            :key="install.folderName + img"
                            :filename="img"
                            :install="install.folderName"
                            @click.native="openScreenshot(install.folderName, img)" width="150"></Screenshot>
            </div>

            <template v-if="install.achievements">
                <br>

                <h2>{{
                        _("renderer.tab_mods.install.title_achievements", install.achievements.filter(a =>
                                a.earned).length,
                            install.achievements.length)
                    }}</h2>
                <p v-if="install.achievements.filter(a => a.earned).length < install.achievements.length">
                    {{ _("renderer.tab_mods.install.description_achievements") }}</p>
                <p v-else>{{ _("renderer.tab_mods.install.description_achievements_complete") }}</p>

                <template v-for="achievement in install.achievements">
                    <br>

                    <div>
                        <p><strong>{{ achievement.name }}</strong></p>
                        <p>{{ achievement.description }}</p>
                        <p v-if="achievement.earned"><i class="fas fa-lock-open fa-fw"></i>
                            {{ _("renderer.tab_mods.install.description_achievement_earned") }}</p>
                        <p v-else><i class="fas fa-lock fa-fw"></i>
                            {{ _("renderer.tab_mods.install.description_achievement_not_earned") }}</p>
                    </div>

                </template>

                <br>
            </template>
        </div>
    </div>
</template>

<script>
import Launcher from "../../../js/utils/Launcher";
import LazyLoadedImage from "../../elements/Screenshot";
import Link from "../../elements/Link";
import Screenshot from "../../elements/Screenshot";

export default {
    name: "InstallView",
    components: {Screenshot, Link},
    props: ["install"],
    methods: {
        _: ddmm.translate,
        openFolder: ddmm.shell.showFile,
        openURL: ddmm.shell.openURL,
        getPathToInstall(folderName) {
            return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", folderName);
        },
        getPathToScreenshot(folderName, filename) {
            return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", folderName, "install", filename);
        },
        openScreenshot(folderName, filename) {
            ddmm.shell.showFile(ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", folderName, "install", filename));
        },
        launchInstall(install) {
            Launcher.launch(install, this.$store);
        },
        exportMonika() {
            ddmm.mods.exportMAS(this.installFolder);
        },
        showOptions(install) {
            this.$store.commit("select_install", {install});
            this.$store.commit("show_modal", {modal: "install_options"});
        },
        formatTime(timeMS) {
            const timeSecs = timeMS / 1000;
            const hours = Math.floor(timeSecs / 3600);
            const seconds = timeSecs % 3600;
            const minutes = Math.floor(seconds / 60);

            return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");
        },
        formatSize(bytes) {
            if (bytes === 0) return "0 B";

            const k = 1024;
            const dm = 2;
            const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];

            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        },
        doBackground() {
            ddmm.install.getBackground(this.install.folderName).then(bg => {
                if (bg) {
                    this.$store.commit("override_background", bg);
                } else {
                    this.$store.commit("override_background", null);
                }
            }).catch(err => {
                this.$store.commit("override_background", null);
            });
        },
        importMAS(folderName) {
            ddmm.mods.importMAS(folderName);
        }
    },
    watch: {
        "install.folderName": function () {
            this.$nextTick(() => {
                this.doBackground();
            });
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.doBackground();
        });
    },
    destroyed() {
        this.$store.commit("override_background", null);
    }
}
</script>

<style scoped>

</style>
