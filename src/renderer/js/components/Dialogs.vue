<template>
    <div>
        <LoginDialog v-if="modalVisible('login')"></LoginDialog>

        <InstallOptionsDialog v-if="modalVisible('install_options')"></InstallOptionsDialog>
        <InstallRenameDialog v-if="modalVisible('install_rename')"></InstallRenameDialog>
        <UninstallDialog v-if="modalVisible('uninstall')"></UninstallDialog>

        <ModOptionsDialog v-if="modalVisible('mod_options')"></ModOptionsDialog>
    </div>
</template>

<script>
    import LoginDialog from "./dialogs/LoginDialog.vue";
    import InstallOptionsDialog from "./dialogs/InstallOptionsDialog.vue";
    import ModOptionsDialog from "./dialogs/ModOptionsDialog.vue";
    import InstallRenameDialog from "./dialogs/InstallRenameDialog.vue";
    import UninstallDialog from "./dialogs/UninstallDialog.vue";

    export default {
        name: "Dialogs",
        components: {UninstallDialog, InstallRenameDialog, ModOptionsDialog, InstallOptionsDialog, LoginDialog},
        methods: {
            modalVisible(modal) {
                return this.$store.state.modals[modal];
            }
        }
    }
</script>

<style scoped>

</style>