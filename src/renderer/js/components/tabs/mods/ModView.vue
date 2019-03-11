<template>
    <div v-if="mod">
        <h1>{{mod}}</h1>
        <p>{{getPathToMod(mod)}} <a href="javascript:;" @click="openFolder(getPathToMod(mod))"
                                    :title="_('renderer.tab_mods.mod.description_external')"><i
                class="fas fa-external-link-alt"></i></a></p>

        <br>

        <p>
            <button class="success"><i class="fas fa-bolt fa-fw"></i> {{_("renderer.tab_mods.mod.button_install")}}
            </button>
            <button class="secondary" @click="showOptions(mod)"><i class="fas fa-cog fa-fw"></i>
                {{_("renderer.tab_mods.mod.button_settings")}}
            </button>
        </p>
    </div>
</template>

<script>
    export default {
        name: "ModView",
        props: ["mod"],
        methods: {
            _: ddmm.translate,
            openFolder: ddmm.app.showFile,
            getPathToMod(filename) {
                return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "mods", filename);
            },
            showOptions(mod) {
                this.$store.commit("select_mod", {mod});
                this.$store.commit("show_modal", {modal: "mod_options"});
            }
        }
    }
</script>

<style scoped>

</style>