<template>
    <div>
        <LoginDialog v-if="modalVisible('login')"></LoginDialog>
        <AccountSettingsDialog v-if="modalVisible('account_settings')"></AccountSettingsDialog>
        <AccountUsernameDialog v-if="modalVisible('account_username')"></AccountUsernameDialog>

        <InstallOptionsDialog v-if="modalVisible('install_options')"></InstallOptionsDialog>
        <InstallRenameDialog v-if="modalVisible('install_rename')"></InstallRenameDialog>
        <SaveDeleteDialog v-if="modalVisible('save_delete')"></SaveDeleteDialog>
        <UninstallDialog v-if="modalVisible('uninstall')"></UninstallDialog>

        <ModOptionsDialog v-if="modalVisible('mod_options')"></ModOptionsDialog>
    </div>
</template>

<script>
    import LoginDialog from "./dialogs/account/LoginDialog.vue";
    import InstallOptionsDialog from "./dialogs/installs/InstallOptionsDialog.vue";
    import ModOptionsDialog from "./dialogs/mods/ModOptionsDialog.vue";
    import InstallRenameDialog from "./dialogs/installs/InstallRenameDialog.vue";
    import UninstallDialog from "./dialogs/installs/UninstallDialog.vue";
    import SaveDeleteDialog from "./dialogs/installs/SaveDeleteDialog.vue";
    import AccountSettingsDialog from "./dialogs/account/AccountSettingsDialog.vue";
    import AccountUsernameDialog from "./dialogs/account/AccountUsernameDialog.vue";

    export default {
        name: "Dialogs",
        components: {
            AccountUsernameDialog,
            AccountSettingsDialog,
            SaveDeleteDialog,
            UninstallDialog, InstallRenameDialog, ModOptionsDialog, InstallOptionsDialog, LoginDialog},
        methods: {
            modalVisible(modal) {
                return this.$store.state.modals[modal];
            }
        }
    }
</script>

<style scoped>

</style>