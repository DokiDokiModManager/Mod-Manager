<template>
    <div>
        <h1>{{_("renderer.tab_options.section_language.title")}}</h1>
        <p>{{_("renderer.tab_options.section_language.subtitle")}}</p>
        <br>
        <p>
            <Link to="https://example.org">{{_("renderer.tab_options.section_language.link_contribute")}}</Link>
        </p>
        <br>
        <p><label for="language-switch-select">{{_("renderer.tab_options.section_language.label_language")}}</label></p>
        <p>
            <select v-model="language_interim" @change="setLanguage" id="language-switch-select">
                <option v-for="language in languages" :value="language.code">
                    {{language.name}}
                </option>
            </select>
        </p>
    </div>
</template>

<script>
    import languages from "../../../data/languages.json";
    import Link from "../../elements/Link";

    export default {
        name: "LanguageOptions",
        components: {Link},
        methods: {
            _: ddmm.translate,
            setLanguage() {
                ddmm.config.saveConfigValue("language", this.language_interim);
                this.$store.commit("show_modal", {modal: "language_switch"})
                ddmm.reloadLanguages();
            }
        },
        data() {
            return {
                language_interim: ddmm.config.readConfigValue("language"),
                languages: languages.languages
            }
        },
        mounted() {
            // fetch("https://hosted.weblate.org/exports/stats/doki-doki-mod-manager/doki-doki-mod-manager/?format=json").then(r => r.json()).then()
        }
    }
</script>

<style scoped>

</style>
