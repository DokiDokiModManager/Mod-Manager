<template>
    <div>
        <h1>{{_("renderer.tab_options.section_discord.title")}}</h1>
        <p>{{_("renderer.tab_options.section_discord.subtitle")}}</p>
        <br>
        <p><strong>{{_("renderer.tab_options.section_discord.description")}}</strong></p>
        <br>
        <p>
            <label><input type="checkbox" v-model="rp_interim" @change="setRichPresence(rp_interim)"> {{_("renderer.tab_options.section_discord.button_enable")}}</label>
        </p>
    </div>
</template>

<script>
    export default {
        name: "DiscordOptions",
        methods: {
            _: ddmm.translate,
            setRichPresence(enabled) {
                ddmm.config.saveConfigValue("discordEnabled", enabled)
            }
        },
        data() {
            return {
                rp_interim: ddmm.config.readConfigValue("discordEnabled")
            }
        }
    }
</script>

<style scoped>

</style>