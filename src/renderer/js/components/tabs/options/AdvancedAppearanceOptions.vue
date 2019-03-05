<template>
    <div>
        <h1>{{_("renderer.tab_options.section_advanced_appearance.title")}}</h1>
        <p>{{_("renderer.tab_options.section_advanced_appearance.subtitle")}}</p>
        <br>
        <button class="danger" v-if="systemBordersEnabled()" @click="setSystemBorders(false)"><i class="fas fa-times fa-fw"></i> {{_("renderer.tab_options.section_advanced_appearance.button_disable_sysborders")}}</button>
        <button class="success" v-else @click="setSystemBorders(true)"><i class="fas fa-check fa-fw"></i> {{_("renderer.tab_options.section_advanced_appearance.button_enable_sysborders")}}</button>
    </div>
</template>

<script>
    import Logger from "../../../utils/Logger";

    export default {
        name: "AdvancedAppearanceOptions",
        methods: {
            _: ddmm.translate,
            systemBordersEnabled() {
                return ddmm.config.readConfigValue("systemBorders");
            },
            setSystemBorders(enabled) {
                Logger.info("Appearance", "System borders are now " + (enabled ? "enabled" : "disabled"));
                ddmm.config.saveConfigValue("systemBorders", enabled);
                this.$forceUpdate();
            }
        }
    }
</script>

<style scoped>

</style>