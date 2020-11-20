<template>
    <Dialog>
        <div style="text-align: center;">
            <br>
            <p><i class="fas fa-gamepad fa-2x"></i></p>
            <br>
            <h2>{{_("renderer.modal_running.title")}}</h2>
            <br>
            <p>{{_("renderer.modal_running.description")}}</p>
            <br>
            <p>
                <button class="primary" @click="openFolder"><i class="fas fa-folder-open"></i>
                    {{_("renderer.modal_running.button_browse")}}
                </button>
            </p>
            <br v-if="canKill">
            <p v-if="!more && canKill" @click="more = true"><a href="javascript:;">{{_("renderer.modal_running.link_more")}}</a></p>
            <p v-if="more">
                <button class="danger" @click="killGame">
                    <i class="fas fa-power-off fa-fw"></i>
                    {{_("renderer.modal_running.button_kill")}}
                </button>
            </p>
        </div>
    </Dialog>
</template>

<script>
    import Dialog from "../base/Dialog";

    export default {
        components: {Dialog},
        name: "GameRunningDialog",
        methods: {
            _: ddmm.translate,
            openFolder() {
                ddmm.shell.showFile(this.$store.state.running_install_path);
            },
            killGame() {
                ddmm.mods.killGame();
            }
        },
        data() {
            return {
                canKill: ddmm.platform !== "win32",
                more: false
            }
        }
    }
</script>

<style scoped>

</style>
