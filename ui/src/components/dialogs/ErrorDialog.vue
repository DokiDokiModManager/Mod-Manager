<template>
    <Dialog style="z-index: 100;">
        <h2 v-if="error.fatal">{{_("renderer.modal_error.title_fatal")}}</h2>
        <h2 v-else>{{_("renderer.modal_error.title_non_fatal")}}</h2>
        <br>
        <p>{{_("renderer.modal_error.description_general")}}</p>
        <br>
        <p>{{_("renderer.modal_error.description_stacktrace")}}</p>
        <br>
        <pre style="overflow: scroll; font-size: 12px; max-height: 150px;">{{error.stacktrace}}</pre>
        <br><br>
        <button class="primary" v-if="error.fatal" @click="restart"><i class="fas fa-redo"></i> {{_("renderer.modal_error.button_restart")}}</button>
        <button class="primary" v-else @click="close"><i class="fas fa-check"></i> {{_("renderer.modal_error.button_continue")}}</button>
        <button class="secondary" @click="copy"><i class="fas fa-copy"></i> {{_("renderer.modal_error.button_copy")}}</button>
    </Dialog>
</template>

<script>
    import Dialog from "./base/Dialog";


    export default {
        components: {Dialog},
        name: "GameRunningDialog",
        methods: {
            _: ddmm.translate,
            openFolder() {
                ddmm.shell.showFile(joinPath(this.$store.state.running_install_path, "install", "game"));
            },
            restart() {
                ddmm.app.restart();
            },
            close() {
                this.$store.commit("hide_modal", {modal: "error"});
            },
            copy() {
                ddmm.app.copyToClipboard(this.error.stacktrace);
            }
        },
        computed: {
            error() {
                return this.$store.state.error;
            }
        }
    }
</script>

<style scoped>

</style>