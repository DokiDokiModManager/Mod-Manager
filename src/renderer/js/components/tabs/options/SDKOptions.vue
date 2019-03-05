<template>
    <div>
        <h1>{{_("renderer.tab_options.section_sdk.title")}}</h1>
        <p>{{_("renderer.tab_options.section_sdk.subtitle")}}</p>
        <br>
        <p><strong>{{_("renderer.tab_options.section_sdk.description_mode")}}</strong></p>
        <p><label><input type="radio" name="sdk_mode_checkbox" value="always" v-model="sdk_mode_interim" @change="updateSDKMode"> {{_("renderer.tab_options.section_sdk.checkbox_always")}}</label></p>
        <p><label><input type="radio" name="sdk_mode_checkbox" value="specified" v-model="sdk_mode_interim" @change="updateSDKMode"> {{_("renderer.tab_options.section_sdk.checkbox_specified")}}</label></p>
        <p><label><input type="radio" name="sdk_mode_checkbox" value="never" v-model="sdk_mode_interim" @change="updateSDKMode"> {{_("renderer.tab_options.section_sdk.checkbox_never")}}</label></p>
    </div>
</template>

<script>

    export default {
        name: "SDKOptions",
        methods: {
            _: ddmm.translate,
            updateSDKMode() {
                this.$store.commit("options", {sdk_mode: this.sdk_mode_interim});
            }
        },
        data() {
            return {
                sdk_mode_interim: ddmm.config.readConfigValue("sdkMode")
            }
        }
    }
</script>

<style scoped>

</style>