<template>
    <div>
        <h1>{{_("renderer.tab_options.section_advanced_appearance.title")}}</h1>
        <p>{{_("renderer.tab_options.section_advanced_appearance.subtitle")}}</p>
        <br>

        <p>
            <label><input type="checkbox" v-model="system_borders_interim" @change="setSystemBorders(system_borders_interim)"> {{_("renderer.tab_options.section_advanced_appearance.button_enable_sysborders")}}</label>
        </p>
    </div>
</template>

<script>
    export default {
        name: "AdvancedAppearanceOptions",
        methods: {
            _: ddmm.translate,
            setSystemBorders(system_borders) {
                ddmm.config.saveConfigValue("systemBorders", system_borders);
            }
        },
        data() {
            return {
                system_borders_interim: ddmm.config.readConfigValue("systemBorders")
            }
        }
    }
</script>

<style scoped>

</style>