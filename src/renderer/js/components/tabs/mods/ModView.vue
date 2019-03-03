<template>
    <div v-if="mod">
        <h1>{{mod}}</h1>
        <p>{{getPathToMod(mod)}} <a href="javascript:;" @click="openFolder(getPathToMod(mod))" :title="_('renderer.tab_mods.mod.description_external')"><i class="fas fa-external-link-alt"></i></a></p>

        <br>

        <p>
            <button class="success" @click="showCreateInstall(getPathToMod(selected_item.id))"><i class="fas fa-bolt fa-fw"></i>  {{_("renderer.tab_mods.mod.button_install")}}</button>
            <button class="secondary" @click="handleModSettingsClick(selected_item.id, $event)"><i class="fas fa-cog fa-fw"></i>  {{_("renderer.tab_mods.mod.button_settings")}}</button>
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
            getPathToMod: function (filename) {
                return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "mods", filename);
            }
        }
    }
</script>

<style scoped>

</style>