<template>
    <div v-if="install">
        <h1>{{install.name}}
            <span class="tag" v-if="install.globalSave">{{_("renderer.tab_mods.install.tag_global_save")}}</span>
            <span class="tag"
                  v-if="install.mod && install.mod.uses_sdk">{{_("renderer.tab_mods.install.tag_sdk")}}</span>
        </h1>
        <p>{{getPathToInstall(install.folderName)}} <a href="javascript:;"
                                                       @click="openFolder(getPathToInstall(install.folderName))"
                                                       :title="_('renderer.tab_mods.mod.description_external')"><i
                class="fas fa-external-link-alt"></i></a></p>

        <br>

        <p>
            <button class="success" @click="launchInstall(install.folderName)"><i class="fas fa-play fa-fw"></i>
                {{_("renderer.tab_mods.install.button_launch")}}
            </button>
            <button class="secondary" @click="showOptions(install)"><i
                    class="fas fa-cog fa-fw"></i> {{_("renderer.tab_mods.install.button_settings")}}
            </button>
        </p>

        <br>

        <template v-if="install.mod">
            <h2>{{install.mod.name}}</h2>
            <p><strong>{{_("renderer.tab_mods.install.description_author", install.mod.author)}}</strong></p>
            <br>
            <p>{{install.mod.description}}</p>

            <template v-if="install.mod.website || install.mod.discord">
                <br>

                <p v-if="install.mod.website"><a href="javascript:;" @click="openURL(install.mod.website)"><i
                        class="fas fa-fw fa-globe"></i> {{_("renderer.tab_mods.install.link_website",
                    install.mod.website)}}</a></p>
                <p v-if="install.mod.discord"><a href="javascript:;"
                                                 @click="openURL('https://discord.gg/' + install.mod.discord)"><i
                        class="fab fa-fw fa-discord"></i> {{_("renderer.tab_mods.install.link_discord", "discord.gg/" +
                    install.mod.discord)}}</a></p>
            </template>

            <br>
        </template>

        <h2 v-if="install.screenshots.length > 1">{{_("renderer.tab_mods.install.title_screenshots",
            install.screenshots.length)}}</h2>
        <h2 v-else-if="install.screenshots.length === 1">{{_("renderer.tab_mods.install.title_screenshots_one")}}</h2>
        <h2 v-else>{{_("renderer.tab_mods.install.title_screenshots_none")}}</h2>
        <p>{{_("renderer.tab_mods.install.description_screenshots")}}</p>

        <br>

        <div class="screenshots" v-if="install.screenshots.length > 0">
            <!--suppress RequiredAttributes, HtmlRequiredAltAttribute -->
            <img v-for="img in install.screenshots" :alt="img" :src="getURLToScreenshot(install.folderName, img)"
                 @click="openScreenshot(install.folderName, img)" width="150">
        </div>

        <template v-if="install.achievements">
            <h2>{{_("renderer.tab_mods.install.title_achievements", install.achievements.filter(a => a.earned).length,
                install.achievements.length)}}</h2>
            <p v-if="install.achievements.filter(a => a.earned).length < install.achievements.length">
                {{_("renderer.tab_mods.install.description_achievements")}}</p>
            <p v-else>{{_("renderer.tab_mods.install.description_achievements_complete")}}</p>

            <template v-for="achievement in install.achievements">
                <br>

                <div :style="{'color': !achievement.earned ? '#777' : 'inherit'}">
                    <p><strong>{{achievement.name}}</strong></p>
                    <p>{{achievement.description}}</p>
                </div>

            </template>

            <br>
        </template>
    </div>
</template>

<script>
    import Launcher from "../../../utils/Launcher";

    export default {
        name: "InstallView",
        props: ["install"],
        methods: {
            _: ddmm.translate,
            openFolder: ddmm.app.showFile,
            getPathToInstall(folderName) {
                return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", folderName);
            },
            getURLToScreenshot(folderName, filename) {
                return ddmm.pathToFile(ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", folderName, "install", filename)) + "?" + Math.random();
            },
            launchInstall(install) {
                Launcher.launch(install);
            },
            showOptions(install) {
                this.$store.commit("select_install", {install});
                this.$store.commit("show_modal", {modal: "install_options"});
            }
        }
    }
</script>

<style scoped>

</style>