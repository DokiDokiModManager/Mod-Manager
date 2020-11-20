<template>
    <div>
        <h1>{{_("renderer.tab_downloads.downloaded.title")}}</h1>

        <div v-if="mods.length === 0" class="text-center">
            <br>
            <p>{{_("renderer.tab_downloads.downloaded.message_none")}}</p>
        </div>

        <p v-if="mods.length > 0"><input type="text" v-model="search" :placeholder="_('renderer.tab_downloads.downloaded.placeholder_search')"
                  @keyup="searchEscapeHandler" @click="search = ''"></p>

        <div v-for="mod in modList" class="mod">
            <div>
                <h3>{{getDisplayName(mod)}}</h3>
                <p>{{_("renderer.tab_downloads.downloaded.description_type", getFileExtension(mod))}}</p>
                <br>
                <p>
                    <button class="primary" @click="installMod(mod)"><i class="fas fa-bolt fa-fw"></i>
                        {{_("renderer.tab_downloads.downloaded.button_install")}}
                    </button>

                    <button class="secondary" @click="showOptions(mod)"><i class="fas fa-cog fa-fw"></i>
                        {{_("renderer.tab_downloads.downloaded.button_options")}}
                    </button>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
    import Fuse from "fuse.js";

    export default {
        name: "DownloadedDownloadsSection",
        methods: {
            _: ddmm.translate,
            showOptions(mod) {
                this.$store.commit("select_mod", {mod});
                this.$store.commit("show_modal", {modal: "mod_options"});
            },
            getPathToMod(filename) {
                return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "mods", filename);
            },
            getFileExtension(filename) {
                const parts = filename.split(".");
                return parts.pop();
            },
            getDisplayName(filename) {
                const parts = filename.split(".");
                parts.pop();
                return parts.join(".");
            },
            installMod(mod) {
                this.$store.dispatch("install_mod", {
                    mod: this.getPathToMod(mod),
                    custom: false
                });
            },
            searchEscapeHandler(e) {
                if (e.key === "Escape") {
                    this.search = "";
                }
            }
        },
        data() {
            return {
                fuse: null,
                search: ""
            }
        },
        computed: {
            mods() {
                return this.$store.state.game_data.mods;
            },
            modList() {
                if (!this.search) return this.mods;
                return this.fuse.search(this.search).map(r => r.item);
            }
        },
        mounted() {
            this.fuse = new Fuse(this.mods);
        }
    }
</script>

<style scoped>

</style>
