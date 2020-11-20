<template>
    <div>
        <h1>{{_("renderer.tab_options.section_updates.title")}}</h1>
        <p>{{_("renderer.tab_options.section_updates.subtitle")}}</p>
        <br>
        <p><strong>{{_("renderer.tab_options.section_updates.description_current_version", version)}}</strong></p>
        <p><strong>{{_("renderer.tab_options.section_updates.description_latest_version", latest)}}</strong></p>

        <br>

        <template v-if="update_status === 'none'">
            <p>{{_("renderer.tab_options.section_updates.description_no_update")}}</p>

            <br>

            <button class="primary" @click="checkUpdate"><i class="fas fa-sync fa-fw"></i> {{_("renderer.tab_options.section_updates.button_check")}}</button>
        </template>
        <template v-else-if="update_status === 'available'">
            <p>{{_("renderer.tab_options.section_updates.description_has_update")}}</p>

            <br>

            <button class="primary" @click="doUpdate"><i class="fas fa-download fa-fw"></i> {{_("renderer.tab_options.section_updates.button_download")}}</button>
        </template>
        <template v-else-if="update_status === 'downloading'">
            <p>{{_("renderer.tab_options.section_updates.description_downloading")}}</p>
        </template>
        <template v-else-if="update_status === 'downloaded'">
            <p>{{_("renderer.tab_options.section_updates.description_downloaded")}}</p>
        </template>
    </div>
</template>

<script>
    import UpdateChecker from "../../../js/utils/UpdateChecker";

    export default {
        name: "UpdateOptions",
        methods: {
            _: ddmm.translate,
            doUpdate() {
                this.$store.commit("set_update_status", "downloading");
                ddmm.app.downloadUpdate();
            },
            checkUpdate() {
                this.checking = true;

                UpdateChecker.getLatest(this.$store).then(latest => {
                    this.latest = latest;
                }).finally(() => {
                    this.checking = false;
                });
            }
        },
        data() {
            return {
                version: ddmm.version,
                latest: "",
                checking: true
            }
        },
        computed: {
            update_status() {
                return this.$store.state.update;
            }
        },
        mounted() {
            this.checkUpdate();
        }
    }
</script>

<style scoped>

</style>
