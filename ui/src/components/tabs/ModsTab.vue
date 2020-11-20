<template>
    <div class="page-content">
        <div class="mod-viewer-pane">
            <div class="mod-viewer-mod-list">
                <!-- Search box -->
                <div><input type="text" class="small"
                            :placeholder="_('renderer.tab_mods.list.placeholder_search')" autofocus
                            v-model="search" @keyup="searchEscapeHandler" @click="search = ''"></div>
                <br>
                <!-- Game install options -->
                <div class="mod-view-mod-list-title">{{_("renderer.tab_mods.list.header_new")}}</div>
                <div
                        :class="{'mod-view-mod-list-entry': true, 'active': selected_item.type === 'create'}"
                        @click="handleCreateClick(false)">{{_("renderer.tab_mods.list.link_install")}}
                </div>
                <br>

                <!-- Installed games -->
                <template v-for="cat in categories">
                    <div class="mod-view-mod-list-title" v-if="searchResultsInstalls.filter(i => i.category === cat).length > 0">
                        {{cat ? cat : _("renderer.tab_mods.list.header_installed")}}
                    </div>
                    <div
                            :class="{'mod-view-mod-list-entry': true, 'active': selected_item.id === install.folderName && selected_item.type === 'install'}"
                            v-for="install in searchResultsInstalls.filter(i => i.category === cat)"
                            @dblclick="launchInstall(install)"
                            @click="handleInstallClick(install.folderName)"
                            :title="getPathToInstall(install.folderName)"
                    >
                        <span>
                            {{install.name}}
                            <span v-if="install.archived"><i class="fas fa-archive fa-fw"></i></span>
                        </span>
                        <span class="mod-view-mod-list-entry-button"
                              @click="showInstallOptions(install)"><i
                                class="fas fa-cog"></i></span>
                    </div>

                    <br v-if="searchResultsInstalls.filter(i => i.category === cat).length > 0">
                </template>
            </div>
            <div class="mod-viewer-mod-display">
                <InstallView v-if="selectedInstall" :install="selectedInstall"></InstallView>
                <CreationView v-else-if="selected_item.type === 'create'"></CreationView>
            </div>
        </div>
    </div>
</template>

<script>
    import Fuse from "fuse.js";

    import InstallView from "./mods/InstallView.vue";
    import ModView from "./mods/ModView.vue";
    import CreationView from "./mods/CreationView.vue";

    import Logger from "../../js/utils/Logger";
    import Launcher from "../../js/utils/Launcher";

    export default {
        name: "ModsTab",
        components: {CreationView, ModView, InstallView},
        methods: {
            // helper methods
            _: ddmm.translate,
            getPathToInstall(folderName) {
                return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", folderName);
            },

            // install list interaction handlers
            handleCreateClick(advanced) {
                Logger.info("Mod List", "Selected creation (advanced = " + advanced + ")");
                this.$store.commit("install_list_selection", {
                    type: "create"
                });
            },
            handleInstallClick(folderName) {
                Logger.info("Mod List", "Selected install " + folderName);
                this.$store.commit("install_list_selection", {
                    type: "install",
                    id: folderName
                });
            },
            showInstallOptions(install) {
                this.$store.commit("select_install", {install});
                this.$store.commit("show_modal", {modal: "install_options"});
            },

            // install launch logic
            launchInstall(install) {
                Launcher.launch(install, this.$store);
            },

            // search box interaction handlers
            searchEscapeHandler(e) {
                if (e.key === "Escape") {
                    this.search = "";
                }
            }
        },
        data() {
            return {
                search: "",
                fuse: null
            };
        },
        computed: {
            categories() {
                // noinspection JSCheckFunctionSignatures
                return Array.from(new Set(this.$store.state.game_data.installs.map(install => install.category))).sort((a, b) => {
                    if (!a || a === "") return 1; // sort uncategorised to the bottom
                    if (!b || b === "") return -1;

                    const uA = a.toUpperCase();
                    const uB = b.toUpperCase();

                    if (uA < uB) return -1;
                    if (uA > uB) return 1;
                    return 0;
                });
            },

            selected_item() {
                return this.$store.state.install_list_selection;
            },

            installs() {
                return this.$store.state.game_data.installs;
            },

            searchResultsInstalls() {
                if (!this.search) return this.installs;
                return this.fuse.search(this.search).map(r => r.item);
            },

            selectedInstall() {
                if (this.selected_item.type === "install") {
                    return this.installs.find(install => install.folderName === this.selected_item.id);
                } else {
                    return null;
                }
            }
        },

        beforeMount() {
            this.fuse = new Fuse(this.installs, {
                keys: ["name", "folderName", "mod.name", "mod.author"]
            });
        }
    }
</script>

<style scoped>

</style>
