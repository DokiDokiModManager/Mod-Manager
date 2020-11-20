<template>
    <ConfirmDialog :title="_('renderer.modal_save_delete.title')"
                   :yes_text="_('renderer.modal_save_delete.button_affirmative')"
                   :no_text="_('renderer.modal_save_delete.button_negative')"
                   :checkbox="_('renderer.modal_save_delete.confirmation')"
                   @input="uninstall"
    >
        {{_("renderer.modal_save_delete.body", install.name)}}
    </ConfirmDialog>
</template>

<script>
    import ConfirmDialog from "../base/ConfirmDialog.vue";

    export default {
        name: "SaveDeleteDialog",
        components: {ConfirmDialog},
        methods: {
            _: ddmm.translate,
            uninstall(confirm) {
                if (confirm) {
                    ddmm.mods.deleteSaveData(this.install.folderName);
                }
                this.$store.commit("hide_modal", {modal: "save_delete"});
            }
        },
        computed: {
            install() {
                return this.$store.state.selected_install;
            }
        },
    }
</script>

<style scoped>

</style>
