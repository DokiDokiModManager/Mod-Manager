<template>
    <ConfirmDialog :title="_('renderer.modal_uninstall.title')"
                   :yes_text="_('renderer.modal_uninstall.button_affirmative')"
                   :no_text="_('renderer.modal_uninstall.button_negative')"
                   :checkbox="_('renderer.modal_uninstall.confirmation')"
                   @input="uninstall"
    >
        {{_(install.globalSave ? "renderer.modal_uninstall.body_globalsave" : "renderer.modal_uninstall.body", install.name)}}
    </ConfirmDialog>
</template>

<script>
    import ConfirmDialog from "../base/ConfirmDialog.vue";

    export default {
        name: "UninstallDialog",
        components: {ConfirmDialog},
        methods: {
            _: ddmm.translate,
            uninstall(confirm) {
                if (confirm) {
                    ddmm.mods.deleteInstall(this.install.folderName);
                }
                this.$store.commit("hide_modal", {modal: "uninstall"});
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
