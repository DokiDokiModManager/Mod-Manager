<template>
    <div class="main-content">
        <h1>{{ _("renderer.tab_mods.install_creation.title") }}</h1>

        <template v-if="has_free_space">

            <div class="form-group">
                <p><label>{{ _("renderer.tab_mods.install_creation.label_install_name") }}</label></p>
                <p><input type="text" :placeholder="_('renderer.tab_mods.install_creation.placeholder_install_name')"
                          v-model="interim_install_creation.install_name" @keyup="installNameKeyUp"></p>
            </div>


            <p v-if="!is_installing && install_creation.folder_name.length > 2 && installExists(install_creation.folder_name)">
                <strong>{{ _("renderer.tab_mods.install_creation.status_exists") }}</strong>
            </p>

            <div class="form-group">
                <ModSelector @input="selectMod" :initial_mod="install_creation.mod"></ModSelector>
            </div>

            <div class="form-group">
                <ChunkyRadioButtons
                    :options="[_('renderer.tab_mods.install_creation.option_local_save'), _('renderer.tab_mods.install_creation.option_global_save')]"
                    v-model="interim_install_creation.save_option"></ChunkyRadioButtons>
            </div>

            <p v-if="install_creation.save_option === 1">
                {{ _("renderer.tab_mods.install_creation.warning_global_save") }}
            </p>

            <div v-if="is_installing" class="form-group">
                <button class="primary" disabled><i class="fas fa-spinner fa-spin fa-fw"></i>
                    {{ _("renderer.tab_mods.install_creation.button_installing") }}
                </button>
            </div>

            <div v-else class="form-group">
                <button class="primary" :disabled="shouldDisableCreation" @click="install"><i
                    class="fas fa-bolt fa-fw"></i> {{ _("renderer.tab_mods.install_creation.button_install") }}
                </button>
            </div>

        </template>

        <template v-else>
            <p>{{ _("renderer.tab_mods.install_creation.warning_no_space") }}</p>
        </template>
    </div>
</template>

<script>
import ChunkyRadioButtons from "../../elements/ChunkyRadioButtons.vue";
import ModSelector from "../../elements/ModSelector";

export default {
    name: "CreationView",
    components: {ModSelector, ChunkyRadioButtons},
    data() {
        return {
            has_free_space: false,
            is_installing: false,
            interim_install_creation: {
                install_name: this.$store.state.install_creation_data.install_name,
                folder_name: this.$store.state.install_creation_data.folder_name,
                mod: this.$store.state.install_creation_data.mod,
                save_option: this.$store.state.install_creation_data.save_option
            }
        }
    },
    methods: {
        _: ddmm.translate,
        installNameKeyUp() {
            this.$store.commit("set_install_creation", {
                install_name: this.interim_install_creation.install_name
            });

            const folderName = this.interim_install_creation.install_name
                .trim()
                .toLowerCase()
                .replace(/\W/g, "-")
                .replace(/-+/g, "-")
                .substring(0, 32);

            this.interim_install_creation.folder_name = folderName;

            ddmm.install.pathExists(folderName).then(exists => {
                if (ddmm.mods.installExists(folderName)) {
                    this.$store.commit("set_install_creation", {
                        folder_name: folderName + "-" + Math.floor(Math.random() * 100)
                    });
                } else {
                    this.$store.commit("set_install_creation", {
                        folder_name: folderName
                    });
                }
            });
        },
        install() {
            this.$store.commit("installation_status", {
                installing: true,
                preloaded_install_folder: this.install_creation.folder_name
            });
            ddmm.mods.createInstall({
                folderName: this.install_creation.folder_name,
                installName: this.install_creation.install_name,
                globalSave: this.install_creation.save_option === 1,
                mod: this.install_creation.mod
            });
            this.is_installing = true;
            this.$store.commit("set_install_creation", {
                mod: "",
                install_name: "",
                folder_name: ""
            });
        },
        selectMod(mod) {
            this.$store.commit("set_install_creation", {mod});
        }
    },
    computed: {
        install_creation() {
            return this.$store.state.install_creation_data;
        },
        shouldDisableCreation() {
            return this.is_installing || this.install_creation.install_name.length < 2 || this.install_creation.folder_name.length < 2;
        }
    },
    watch: {
        "interim_install_creation.save_option"() {
            this.$store.commit("set_install_creation", {
                save_option: this.interim_install_creation.save_option
            });
        }
    },
    mounted() {
        ddmm.system.getFreeSpace(ddmm.config.readConfigValue("installFolder")).then(space => {
            this.has_free_space = space > 2147483648;
        });
    }
}
</script>

<style scoped>

</style>
