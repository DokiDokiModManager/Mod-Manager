<template>
    <div>
        <h1>{{_("renderer.tab_options.section_advanced_appearance.title")}}</h1>
        <p>{{_("renderer.tab_options.section_advanced_appearance.subtitle")}}</p>
        <br>
        <button class="danger" v-if="systemBordersEnabled" @click="setSystemBorders(false)"><i class="fas fa-times fa-fw"></i> {{_("renderer.tab_options.section_advanced_appearance.button_disable_sysborders")}}</button>
        <button class="success" v-else @click="setSystemBorders(true)"><i class="fas fa-check fa-fw"></i> {{_("renderer.tab_options.section_advanced_appearance.button_enable_sysborders")}}</button>
    </div>
</template>

<script>
    export default {
        name: "AdvancedAppearanceOptions",
        methods: {
            _: ddmm.translate,
            setSystemBorders(system_borders) {
                this.$store.commit("options", {system_borders});
            }
        },
        computed: {
            systemBordersEnabled() {
                return this.$store.state.options.system_borders;
            }
        }
    }
</script>

<style scoped>

</style>