<template>
    <div>
        <p><label>{{_("renderer.tab_mods.install_creation.label_mod")}}</label></p>
        <p>
            <select v-model="mod">
                <option :value="'!none'">{{_("renderer.tab_mods.install_creation.modlist_none")}}</option>
                <option :value="'!custom'">{{_("renderer.tab_mods.install_creation.modlist_custom")}}</option>

                <optgroup :label="_('renderer.tab_mods.install_creation.modlist_library')">
                    <option v-for="mod in mods" :value="getPathToMod(mod)">{{getDisplayName(mod)}}</option>
                </optgroup>
            </select>
        </p>
        <template v-if="mod === '!custom'">
            <br>
            <p><input type="text" :placeholder="_('renderer.tab_mods.install_creation.description_mod')"
                      v-model="actual_mod" readonly @click="selectMod"
                      style="cursor: pointer;"></p>
        </template>
    </div>
</template>

<script>
    export default {
        name: "ModSelector",
        props: ["initial_mod"],
        data() {
            return {
                mod: this.initial_mod || "!none",
                actual_mod: ""
            }
        },
        methods: {
            _: ddmm.translate,
            selectMod() {
                ddmm.shell.browse.mod().then(mod => {
                    this.actual_mod = mod;
                    this.$emit("input", this.actual_mod);
                });
            },
            getPathToMod(filename) {
                return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "mods", filename);
            },
            getDisplayName(filename) {
                const parts = filename.split(".");
                parts.pop();
                return parts.join(".");
            }
        },
        computed: {
            mods() {
                return this.$store.state.game_data.mods;
            }
        },
        watch: {
            mod(newMod) {
                if (newMod === "!none") {
                    this.$emit("input", null);
                } else if (newMod === "!custom") {
                    this.$emit("input", this.actual_mod);
                } else {
                    this.$emit("input", this.mod);
                }
            }
        }
    }
</script>

<style scoped>

</style>
