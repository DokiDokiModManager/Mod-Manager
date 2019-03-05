<template>
    <div class="page-content">
        <div class="mod-viewer-pane">
            <div class="mod-viewer-mod-list">
                <!-- Search box -->
                <div><input type="text" class="small"
                            :placeholder="_('renderer.tab_mods.list.placeholder_search')" autofocus
                            @keydown="searchEscapeHandler" @focus="search = ''" v-model="search"></div>
                <br>
                <!-- Game install options -->
                <div class="mod-view-mod-list-title">{{_("renderer.tab_mods.list.header_new")}}</div>
                <div
                        :class="{'mod-view-mod-list-entry': true, 'active': selected_item.type === 'create'}"
                        @click="handleCreateClick()">{{_("renderer.tab_mods.list.link_install")}}
                </div>
                <br>
                <!-- Installed games -->
                <div class="mod-view-mod-list-title" v-if="searchResultsInstalls.length > 0">
                    {{_("renderer.tab_mods.list.header_installed")}}
                </div>
                <div
                        :class="{'mod-view-mod-list-entry': true, 'active': selected_item.id === install.folderName && selected_item.type === 'install'}"
                        v-for="install in searchResultsInstalls"
                        @dblclick="launchInstall(install.folderName)"
                        @mouseup="handleInstallClick(install.folderName, install.name, $event)"
                        :title="getPathToInstall(install.folderName)"
                >
                    <span>{{install.name}}</span>
                    <span class="mod-view-mod-list-entry-button"
                          @click="handleInstallSettingsClick(install.folderName, install.name, $event)"><i
                            class="fas fa-cog"></i></span>
                </div>
                <br v-if="searchResultsInstalls.length > 0">
                <!-- Downloaded mods -->
                <div class="mod-view-mod-list-title" v-if="searchResultsMods.length > 0">
                    {{_("renderer.tab_mods.list.header_downloaded")}}
                </div>
                <div
                        :class="{'mod-view-mod-list-entry': true, 'active': selected_item.id === mod.filename && selected_item.type === 'mod', 'disabled': mod.downloading}"
                        v-for="mod in searchResultsMods"
                        @mouseup="handleModClick(mod.filename, mod.downloading, $event)"
                        @dblclick="showCreateInstall(getPathToMod(mod.filename))"
                        :title="getPathToMod(mod.filename)"
                >
                    <span><i class="fas fa-spinner fa-spin fa-fw" v-if="mod.downloading"></i> {{mod.filename}}</span>
                    <span class="mod-view-mod-list-entry-button"
                          @click="handleModSettingsClick(mod.filename, $event)"><i
                            class="fas fa-cog"></i></span>
                </div>
            </div>
            <div class="mod-viewer-mod-display">
                <InstallView v-if="selectedInstall" :install="selectedInstall"></InstallView>
                <ModView v-else-if="selectedMod" :mod="selectedMod"></ModView>
                <CreationView v-else-if="selected_item.type === 'create'"></CreationView>
            </div>
        </div>
    </div>
</template>

<script>

    import InstallView from "./mods/InstallView.vue";
    import ModView from "./mods/ModView.vue";
    import CreationView from "./mods/CreationView.vue";

    import Logger from "../../utils/Logger";
    import Launcher from "../../utils/Launcher";

    export default {
        name: "ModsTab",
        components: {CreationView, ModView, InstallView},
        methods: {
            // helper methods
            _: ddmm.translate,
            getPathToInstall(folderName) {
                return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", folderName);
            },
            getPathToMod(filename) {
                return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "mods", filename);
            },

            // install list interaction handlers
            handleCreateClick() {
                Logger.info("Mod List", "Selected creation");
                this.selected_item.type = "create";
            },
            handleInstallClick(folderName, name, e) {
                Logger.info("Mod List", "Selected install " + folderName);
                if (e.button === 0) {
                    this.selected_item.type = "install";
                    this.selected_item.id = folderName;
                }
            },
            handleModClick(filename, downloading, e) {
                Logger.info("Mod List", "Selected mod " + filename);
                if (e.button === 0) {
                    this.selected_item.type = "mod";
                    this.selected_item.id = filename;
                }
            },

            // install launch logic
            launchInstall(install) {
                Launcher.launch(install);
            },

            // search box interaction handlers
            searchEscapeHandler(e) {
                if (e.key === "Escape") {
                    Logger.info("Mod List", "Cleared search");
                    this.search = "";
                }
            }
        },
        data() {
            return {
                selected_item: {
                    id: "",
                    type: ""
                },
                search: ""
            };
        },
        computed: {
            installs() {
                return this.$store.state.game_data.installs;
            },

            mods() {
                return this.$store.state.game_data.mods;
            },

            searchResultsInstalls() {
                return this.installs || [];
                // return this.search.length > 0 ? this.installs_search.search(this.search) : this.installs;
            },
            searchResultsMods() {
                return this.mods || [];
                // return this.search.length > 0 ? this.mods_search.search(this.search) : this.mods;
            },

            selectedInstall() {
                if (this.selected_item.type === "install") {
                    return this.installs.find(install => install.folderName === this.selected_item.id);
                } else {
                    return null;
                }
            },
            selectedMod() {
                if (this.selected_item.type === "mod") {
                    return this.selected_item.id;
                } else {
                    return null;
                }
            }
        }
    }
</script>

<style scoped>

</style>