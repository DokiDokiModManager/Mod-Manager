<template>
    <ConfirmDialog :title="_('renderer.modal_mod_delete.title')"
                   :yes_text="_('renderer.modal_mod_delete.button_affirmative')"
                   :no_text="_('renderer.modal_mod_delete.button_negative')"
                   @input="deleteMod"
    >
        {{_("renderer.modal_mod_delete.body", mod)}}
    </ConfirmDialog>
</template>

<script>
    import ConfirmDialog from "../base/ConfirmDialog.vue";

    export default {
        name: "ModDeleteDialog",
        components: {ConfirmDialog},
        methods: {
            _: ddmm.translate,
            deleteMod(confirm) {
                if (confirm) {
                    ddmm.mods.deleteMod(this.mod);
                }
                this.$store.commit("hide_modal", {modal: "mod_delete"});
            }
        },
        computed: {
            mod() {
                return this.$store.state.selected_mod;
            }
        },
    }
</script>

<style scoped>

</style>
