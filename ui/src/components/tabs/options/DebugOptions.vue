<template>
    <div>
        <h1>{{_("renderer.tab_options.section_testing.title")}}</h1>
        <p>{{_("renderer.tab_options.section_testing.subtitle")}}</p>

        <br>
        <h2>{{_("renderer.tab_options.section_testing.header_mod_debug")}}</h2>
        <p>{{_("renderer.tab_options.section_testing.description_mod_debug")}}</p>
        <br>
        <p>
            <label><input type="checkbox" v-model="sdk_debugging_interim" @change="setSDKDebugging(sdk_debugging_interim)"> {{_("renderer.tab_options.section_testing.checkbox_logging")}}</label>
        </p>

        <br>

        <h2>{{_("renderer.tab_options.section_testing.header_renpy")}}</h2>
        <p>{{_("renderer.tab_options.section_testing.description_renpy")}}</p>
        <br>
        <p>
            <label><input type="checkbox" v-model="renpy_interim.skipSplash" @change="setRenpy(renpy_interim)"> {{_("renderer.tab_options.section_testing.checkbox_renpy_skipsplash")}}</label>
        </p>
        <p>
            <label><input type="checkbox" v-model="renpy_interim.skipMenu" @change="setRenpy(renpy_interim)"> {{_("renderer.tab_options.section_testing.checkbox_renpy_skipmenu")}}</label>
        </p>

    </div>
</template>

<script>
    export default {
        name: "DebugOptions",
        data() {
            return {
                sdk_debugging_interim: ddmm.config.readConfigValue("sdkDebuggingEnabled"),
                renpy_interim: ddmm.config.readConfigValue("renpy")
            }
        },
        methods: {
            _: ddmm.translate,
            setSDKDebugging(enabled) {
                ddmm.config.saveConfigValue("sdkDebuggingEnabled", !!enabled);
            },
            setRenpy(renpy) {
                ddmm.config.saveConfigValue("renpy", renpy);
            }
        }
    }
</script>

<style scoped>

</style>