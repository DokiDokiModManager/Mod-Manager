<template>
    <MenuDialog>
        <div class="dialog-menu-description">
            <h3>{{mod}}</h3>
        </div>
        <div class="dialog-menu-separator"></div>
        <div class="dialog-menu-item">
            <i class="fas fa-bolt fa-fw"></i> {{_("renderer.menu_mod_options.install")}}
        </div>
        <div class="dialog-menu-item">
            <i class="fas fa-trash fa-fw"></i> {{_("renderer.menu_mod_options.delete")}}
        </div>
        <div class="dialog-menu-separator"></div>
        <div class="dialog-menu-item" @click="close">
            <i class="fas fa-times fa-fw"></i> {{_("renderer.menu_mod_options.cancel")}}
        </div>
    </MenuDialog>
</template>

<script>
    import MenuDialog from "../base/MenuDialog.vue";

    export default {
        name: "ModOptionsDialog",
        components: {MenuDialog},
        computed: {
            mod() {
                return this.$store.state.selected_mod;
            }
        },
        methods: {
            _: ddmm.translate,
            close() {
                this.$store.commit("hide_modal", {modal: "mod_options"});
            }
        }
    }
</script>

<style scoped>

</style>