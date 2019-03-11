<template>
    <PromptDialog :title="_('renderer.modal_rename.title')" :placeholder="install.name"
                  :submit_text="_('renderer.modal_rename.button_affirmative')"
                  :cancel_text="_('renderer.modal_rename.button_negative')"
                  @input="rename"
    >
        {{_("renderer.modal_rename.body", install.name)}}
    </PromptDialog>
</template>

<script>
    import PromptDialog from "../base/PromptDialog.vue";

    export default {
        name: "InstallRenameDialog",
        components: {PromptDialog},
        methods: {
            _: ddmm.translate,
            rename(newName) {
                if (newName) {
                    ddmm.mods.renameInstall(this.install.folderName, newName);
                }
                this.$store.commit("hide_modal", {modal: "install_rename"});
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