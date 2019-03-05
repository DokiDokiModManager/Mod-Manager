<template>
    <div>
        <h1>{{_("renderer.tab_options.section_language.title")}}</h1>
        <p>{{_("renderer.tab_options.section_language.subtitle")}}</p>
        <br>
        <p><strong>{{_("renderer.tab_options.section_language.description_restart")}}</strong></p>
        <div class="form-group">
            <p><label>{{_("renderer.tab_options.section_language.label_language")}}</label></p>
            <p>
                <select v-model="language_interim" @change="setLanguage">
                    <option value="en-GB">English (United Kingdom)</option>
                    <option value="es-419">Español (Latinoamérica)</option>
                </select>
            </p>
        </div>
    </div>
</template>

<script>
    import Logger from "../../../utils/Logger";

    export default {
        name: "LanguageOptions",
        methods: {
            _: ddmm.translate,
            setLanguage() {
                Logger.info("i18n", "Language set to " + this.language_interim);
                ddmm.config.saveConfigValue("language", this.language_interim);
            }
        },
        data() {
            return {
                language_interim: ddmm.config.readConfigValue("language")
            }
        }
    }
</script>

<style scoped>

</style>