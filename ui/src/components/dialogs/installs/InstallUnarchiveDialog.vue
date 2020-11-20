<template>
    <Dialog>
        <h2>{{_("renderer.modal_unarchive.title")}}</h2>
        <br>
        <p>{{_("renderer.modal_unarchive.description", install.name)}}</p>
        <br>
        <ModSelector v-model="mod"></ModSelector>
        <br>
        <p>
            <button class="success" @click="unarchive"><i class="fas fa-play fa-fw"></i> {{_("renderer.modal_unarchive.button_launch")}}</button>
            <button class="secondary" @click="close"><i class="fas fa-times fa-fw"></i> {{_("renderer.modal_unarchive.button_cancel")}}</button>
        </p>
    </Dialog>
</template>

<script>
    import Dialog from "../base/Dialog";
    import ModSelector from "../../elements/ModSelector";

    export default {
        name: "InstallUnarchiveDialog",
        components: {ModSelector, Dialog},
        data() {
            return {
                mod: ""
            }
        },
        methods: {
            _: ddmm.translate,
            close() {
                this.$store.commit("hide_modal", {modal: "install_unarchive"});
            },
            unarchive() {
                this.close();
                this.$store.commit("show_modal", {modal: "unarchiving"});
                ddmm.mods.unarchiveInstall({folderName: this.install.folderName, mod: this.mod})
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
