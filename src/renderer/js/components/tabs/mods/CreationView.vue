<template>
    <div>
        <h1>{{_("renderer.tab_mods.install_creation.title")}}</h1>

        <template v-if="hasFreeSpace">

            <div class="form-group">
                <p><label>{{_("renderer.tab_mods.install_creation.label_install_name")}}</label></p>
                <p><input type="text" :placeholder="_('renderer.tab_mods.install_creation.label_install_name')"
                          v-model="install_creation.install_name" @keyup="generateInstallFolderName"></p>
            </div>

            <div class="form-group">
                <p><label>{{_("renderer.tab_mods.install_creation.label_folder_name")}}</label></p>
                <p><input type="text" :placeholder="_('renderer.tab_mods.install_creation.label_folder_name')"
                          v-model="install_creation.folder_name"></p>
            </div>

            <p v-if="!is_installing && install_creation.folder_name.length > 2 && installExists(install_creation.folder_name)">
                <strong>{{_("renderer.tab_mods.install_creation.status_exists")}}</strong>
            </p>

            <div class="form-group">
                <p><label><input type="checkbox" v-model="install_creation.has_mod">
                    {{_("renderer.tab_mods.install_creation.label_has_mod")}}</label></p>
            </div>

            <div class="form-group" v-if="install_creation.has_mod">
                <p><label>{{_("renderer.tab_mods.install_creation.label_mod")}}</label></p>
                <p><input type="text" :placeholder="_('renderer.tab_mods.install_creation.description_mod')"
                          v-model="install_creation.mod" readonly @click="installCreationSelectMod"
                          style="cursor: pointer;"></p>
            </div>

            <div class="form-group">
                <ChunkyRadioButtons
                        :options="[_('renderer.tab_mods.install_creation.option_local_save'), _('renderer.tab_mods.install_creation.option_global_save')]"
                        v-model="install_creation.save_option"></ChunkyRadioButtons>
            </div>


            <div v-if="install_creation.save_option === 1">
                <p>{{_("renderer.tab_mods.install_creation.description_global_save")}}</p>
                <br>
                <p><strong>{{_("renderer.tab_mods.install_creation.warning_global_save")}}</strong></p>
            </div>

            <div v-else>
                <p>{{_("renderer.tab_mods.install_creation.description_local_save")}}</p>
            </div>


            <div v-if="is_installing" class="form-group">
                <button class="primary" disabled><i class="fas fa-spinner fa-spin fa-fw"></i>
                    {{_("renderer.tab_mods.install_creation.button_installing")}}
                </button>
            </div>

            <div v-else class="form-group">
                <button class="primary" :disabled="shouldDisableCreation" @click="install"><i
                        class="fas fa-bolt fa-fw"></i> {{_("renderer.tab_mods.install_creation.button_install")}}
                </button>
            </div>

        </template>

        <template v-else>
            <p>{{_("renderer.tab_mods.install_creation.warning_no_space")}}</p>
        </template>
    </div>
</template>

<script>
    import ChunkyRadioButtons from "../../elements/ChunkyRadioButtons.vue";

    export default {
        name: "CreationView",
        components: {ChunkyRadioButtons},
        data() {
            return {
                install_creation: {
                    install_name: "",
                    folder_name: "",
                    has_mod: false,
                    mod: "",
                    save_option: 0
                },

                is_installing: false
            }
        },
        methods: {
            _: ddmm.translate,
            installExists: ddmm.mods.installExists,
            hasFreeSpace() {
                return ddmm.app.getDiskSpace() > 2147483648; // 2 GiB
            },
            generateInstallFolderName() {
                this.install_creation.folder_name = this.install_creation.install_name
                    .trim()
                    .toLowerCase()
                    .replace(/\W/g, "-")
                    .replace(/-+/g, "-")
                    .substring(0, 32);
            },
            installCreationSelectMod() {
                const mod = ddmm.mods.browseForMod();
                if (mod) {
                    this.install_creation.mod = mod;
                }
            },
            install() {
                ddmm.mods.createInstall({
                    folderName: this.install_creation.folder_name,
                    installName: this.install_creation.install_name,
                    globalSave: this.install_creation.save_option === 1,
                    mod: this.install_creation.has_mod ? this.install_creation.mod : null
                });
                this.is_installing = true;
            }
        },
        computed: {
            shouldDisableCreation() {
                return this.is_installing || (this.install_creation.has_mod && !this.install_creation.mod)
                    || this.install_creation.install_name.length < 2 || this.install_creation.folder_name.length < 2
                    || ddmm.mods.installExists(this.install_creation.folder_name);
            },
            user() {
                return this.$store.state.user;
            }
        }
    }
</script>

<style scoped>

</style>