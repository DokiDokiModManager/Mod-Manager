<template>
    <div>
        <h1>{{_("renderer.tab_options.section_updates.title")}}</h1>
        <p>{{_("renderer.tab_options.section_updates.subtitle")}}</p>
        <br>
        <p><strong>{{_("renderer.tab_options.section_updates.description_current_version", version)}}</strong></p>
        <br>
        <p><button @click="checkUpdates" class="primary"><i class="fas fa-sync-alt fa-fw"></i> {{_("renderer.tab_options.section_updates.button_check")}}</button></p>
    </div>
</template>

<script>
    import Logger from "../../../utils/Logger";

    export default {
        name: "UpdateOptions",
        methods: {
            _: ddmm.translate,
            checkUpdates() {
                Logger.info("Updates", "Forcing update check");
                ddmm.app.update();
            }
        },
        data () {
            return {
                version: ddmm.version
            }
        }
    }
</script>

<style scoped>

</style>