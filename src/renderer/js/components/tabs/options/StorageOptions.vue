<template>
    <div>
        <h1>{{_("renderer.tab_options.section_storage.title")}}</h1>
        <p>{{_("renderer.tab_options.section_storage.subtitle")}}</p>
        <br>
        <p><strong>{{_("renderer.tab_options.section_storage.description_moving")}}</strong></p>
        <br>
        <p>{{_("renderer.tab_options.section_storage.description_current", installFolder)}}</p>
        <br>
        <button class="primary" @click="moveInstall"><i class="fas fa-folder-open fa-fw"></i> {{_("renderer.tab_options.section_storage.button_change")}}</button>
    </div>
</template>

<script>
    import Logger from "../../../utils/Logger";

    export default {
        name: "StorageOptions",
        methods: {
            _: ddmm.translate,
            moveInstall() {
                Logger.info("Storage", "Beginning install folder move");
                ddmm.app.beginMoveInstall();
            }
        },
        data() {
            return {
                installFolder: ddmm.config.readConfigValue("installFolder")
            }
        }
    }
</script>

<style scoped>

</style>