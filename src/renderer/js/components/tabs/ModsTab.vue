<template>
    <div class="page-content">
        <div class="mod-viewer-pane">
            <div class="mod-viewer-mod-list">
                <div><input type="text" class="small"
                            :placeholder="_('renderer.tab_mods.list.placeholder_search')" autofocus
                            @keydown="_searchEscapeHandler" @focus="search = ''" v-model="search"></div>
                <br>
                <div class="mod-view-mod-list-title">{{_("renderer.tab_mods.list.header_new")}}</div>
                <div
                        :class="{'mod-view-mod-list-entry': true, 'active': selected_item.type === 'create'}"
                        @click="showCreateInstall()">{{_("renderer.tab_mods.list.link_install")}}
                </div>
                <br>
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
        </div>
    </div>
</template>

<script>
    export default {
        name: "ModsTab",
        methods: {
            _: ddmm.translate,
            _searchEscapeHandler: function () {
                //
            }
        },
        data: function () {
            return {
                selected_item: {
                    id: "",
                    type: ""
                },
                search: ""
            };
        },
        computed: {
            searchResultsInstalls: function () {
                return [];
            },
            searchResultsMods: function () {
                return [];
            }
        }
    }
</script>

<style scoped>

</style>