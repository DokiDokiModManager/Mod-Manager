<template>
    <MenuDialog>
        <div class="dialog-menu-description">
            <h3>{{install.name}}</h3>
        </div>
        <div class="dialog-menu-separator"></div>
        <div class="dialog-menu-item" @click="launch">
            <i class="fas fa-play fa-fw"></i> {{_("renderer.menu_install_options.launch")}}
        </div>
        <div class="dialog-menu-separator"></div>
        <div class="dialog-menu-item">
            <i class="fas fa-pencil-alt fa-fw"></i> {{_("renderer.menu_install_options.rename")}}
        </div>
        <div class="dialog-menu-item">
            <i class="fas fa-external-link-alt fa-fw"></i> {{_("renderer.menu_install_options.shortcut")}}
        </div>
        <div class="dialog-menu-separator"></div>
        <div class="dialog-menu-item">
            <i class="fas fa-undo fa-fw"></i> {{_("renderer.menu_install_options.delete_save")}}
        </div>
        <div class="dialog-menu-item">
            <i class="fas fa-trash fa-fw"></i> {{_("renderer.menu_install_options.uninstall")}}
        </div>
        <div class="dialog-menu-separator"></div>
        <div class="dialog-menu-item" @click="close">
            <i class="fas fa-times fa-fw"></i> {{_("renderer.menu_install_options.cancel")}}
        </div>
    </MenuDialog>
</template>

<script>
    import MenuDialog from "./MenuDialog.vue";
    import Launcher from "../../utils/Launcher";

    export default {
        name: "InstallOptionsDialog",
        components: {MenuDialog},
        computed: {
            install() {
                return this.$store.state.selected_install;
            }
        },
        methods: {
            _: ddmm.translate,
            close() {
                this.$store.commit("hide_modal", {modal: "install_options"});
            },
            launch() {
                Launcher.launch(this.install.folderName);
                this.close();
            }
        }
    }
</script>

<style scoped>

</style>