<template>
    <div>
        <InstallOptionsDialog v-if="modalVisible('install_options')"></InstallOptionsDialog>
        <InstallRenameDialog v-if="modalVisible('install_rename')"></InstallRenameDialog>
        <SaveDeleteDialog v-if="modalVisible('save_delete')"></SaveDeleteDialog>
        <UninstallDialog v-if="modalVisible('uninstall')"></UninstallDialog>

        <ModOptionsDialog v-if="modalVisible('mod_options')"></ModOptionsDialog>
    </div>
</template>

<script>
    import InstallOptionsDialog from "./dialogs/installs/InstallOptionsDialog.vue";
    import ModOptionsDialog from "./dialogs/mods/ModOptionsDialog.vue";
    import InstallRenameDialog from "./dialogs/installs/InstallRenameDialog.vue";
    import UninstallDialog from "./dialogs/installs/UninstallDialog.vue";
    import SaveDeleteDialog from "./dialogs/installs/SaveDeleteDialog.vue";
    import AlertDialog from "./dialogs/base/AlertDialog.vue";

    export default {
        name: "Dialogs",
        components: {
            SaveDeleteDialog,
            UninstallDialog,
            InstallRenameDialog,
            ModOptionsDialog,
            InstallOptionsDialog,
            AlertDialog
        },
        methods: {
            _: ddmm.translate,
            modalVisible(modal) {
                return this.$store.state.modals[modal];
            }
        }
    }
</script>

<style scoped>

</style>