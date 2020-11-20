<template>
    <div>
        <h1>{{_("renderer.tab_options.section_storage.title")}}</h1>
        <p>{{_("renderer.tab_options.section_storage.subtitle")}}</p>
        <br>
        <p>{{_("renderer.tab_options.section_storage.description")}}</p>
        <br>
        <p><strong>{{_("renderer.tab_options.section_storage.description_moving")}}</strong></p>
        <br>
        <InstallFolderSelector @folder="setNewFolder"></InstallFolderSelector>
        <br>
        <p><button class="primary" :disabled="!installFolder" @click="move"><i class="fas fa-pencil-alt fa-fw"></i> {{_("renderer.tab_options.section_storage.button_confirm")}}</button></p>
    </div>
</template>

<script>
    import InstallFolderSelector from "../../elements/InstallFolderSelector";

    export default {
        name: "StorageOptions",
        components: {InstallFolderSelector},
        methods: {
            _: ddmm.translate,
            setNewFolder(folder) {
                this.installFolder = folder;
            },
            move() {
                ddmm.app.moveInstallFolder(this.installFolder);
            }
        },
        data() {
            return {
                installFolder: null
            }
        }
    }
</script>

<style scoped>

</style>
