<template>
    <div>
        <h1>{{_("renderer.tab_options.section_discord.title")}}</h1>
        <p>{{_("renderer.tab_options.section_discord.subtitle")}}</p>
        <br>
        <p><strong>{{_("renderer.tab_options.section_discord.description")}}</strong></p>
        <br>
        <button class="danger" v-if="richPresenceEnabled()" @click="setRichPresence(false)"><i class="fas fa-times fa-fw"></i> {{_("renderer.tab_options.section_discord.button_disable")}}</button>
        <button class="success" v-else @click="setRichPresence(true)"><i class="fas fa-check fa-fw"></i> {{_("renderer.tab_options.section_discord.button_enable")}}</button>
    </div>
</template>

<script>
    import Logger from "../../../utils/Logger";

    export default {
        name: "DiscordOptions",
        methods: {
            _: ddmm.translate,
            richPresenceEnabled() {
                return ddmm.config.readConfigValue("discordEnabled");
            },
            setRichPresence(enabled) {
                Logger.info("Discord", "Rich presence is now " + (enabled ? "enabled" : "disabled"));
                ddmm.config.saveConfigValue("discordEnabled", !!enabled);
                this.$forceUpdate();
            }
        }
    }
</script>

<style scoped>

</style>