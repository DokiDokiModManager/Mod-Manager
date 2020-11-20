<template>
    <Dialog>
        <h2>{{_("renderer.modal_category.title")}}</h2>

        <br>

        <div>
            <p v-for="cat in categories" v-if="cat">
                <label><input type="radio" v-model="category" :value="cat"> {{cat}}</label>
            </p>
            <p>
                <label><input type="radio" v-model="category" :value="''"> ({{_("renderer.modal_category.label_none")}})</label>
            </p>
        </div>

        <div class="form-group">
            <p><input type="text" v-model.trim="category" :placeholder="_('renderer.modal_category.placeholder_category')" maxlength="25"></p>
        </div>

        <p>
            <button class="primary" @click="save"><i class="fas fa-check fa-fw"></i> {{_("renderer.modal_category.button_save")}}</button>
            <button class="secondary" @click="close"><i class="fas fa-times fa-fw"></i> {{_("renderer.modal_category.button_cancel")}}</button>
        </p>
    </Dialog>
</template>

<script>
    import Dialog from "../base/Dialog";

    export default {
        name: "InstallCategoryDialog",
        components: {Dialog},
        data() {
            return {
                category: this.$store.state.selected_install.category
            }
        },
        computed: {
            install() {
                return this.$store.state.selected_install;
            },
            categories() {
                // noinspection JSCheckFunctionSignatures
                return Array.from(new Set(this.$store.state.game_data.installs.map(install => install.category))).sort();
            },
        },
        methods: {
            _: ddmm.translate,
            save() {
                ddmm.mods.setCategory(this.install.folderName, this.category);
                this.close()
            },
            close() {
                this.$store.commit("hide_modal", {modal: "install_category"});
            }
        }
    }
</script>

<style scoped>

</style>