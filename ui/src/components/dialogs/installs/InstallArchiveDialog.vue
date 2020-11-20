<template>
    <ConfirmDialog :title="_('renderer.modal_archive.title')"
                   :yes_text="_('renderer.modal_archive.button_affirmative')"
                   :no_text="_('renderer.modal_archive.button_negative')"
                   :checkbox="_('renderer.modal_archive.confirmation')"
                   @input="archive"
    >
        <p>{{_("renderer.modal_archive.body", install.name)}}</p>
        <br>
        <p><strong>{{_("renderer.modal_archive.body_warning")}}</strong></p>
    </ConfirmDialog>
</template>

<script>
    import ConfirmDialog from "../base/ConfirmDialog";

    export default {
        name: "InstallArchiveDialog",
        components: {ConfirmDialog},
        methods: {
            _: ddmm.translate,
            archive(confirm) {
                if (confirm) {
                    ddmm.mods.archiveInstall(this.install.folderName);
                }
                this.$store.commit("hide_modal", {modal: "install_archive"});
            }
        },
        computed: {
            install() {
                return this.$store.state.selected_install;
            }
        }
    }
</script>

<style scoped>

</style>
