<template>
    <div class="page-content">
        <div class="text-container">
            <h1>{{ _("renderer.tab_about.title") }}</h1>
            <p>{{ _("renderer.tab_about.description") }}</p>

            <br>

            <h2>{{ _("renderer.tab_about.title_socials") }}</h2>
            <p>
                <Link to="https://doki.space/discord"><i class="fab fa-discord fa-fw"></i>
                    {{ _("renderer.tab_about.social_discord") }}
                </Link>
            </p>
            <p>
                <Link to="https://www.reddit.com/message/compose?to=zuudo&subject=Doki+Doki+Mod+Manager">
                    <i class="fab fa-reddit fa-fw"></i>
                    {{ _("renderer.tab_about.social_reddit") }}
                </Link>
            </p>
            <p>
                <Link to="mailto:zudo@doki.space"><i class="fas fa-envelope fa-fw"></i>
                    {{ _("renderer.tab_about.social_email") }}
                </Link>
            </p>

            <template v-if="!hide_dynamics">
                <br>

                <template v-if="supporters.length > 0">
                    <h2>{{ _("renderer.tab_about.title_patreon") }}</h2>
                    <p>
                        <Link to="https://patreon.com/zudo">
                            <i class="fas fa-heart"></i>
                            {{ _("renderer.tab_about.link_patreon") }}
                        </Link>
                    </p>
                    <div class="contributors">
                        <div class="contributor" v-for="supporter in supporters">
                            <p>{{ supporter }}</p>
                        </div>
                    </div>
                </template>

                <br>

                <template v-if="translators.length > 0">
                    <h2>{{ _("renderer.tab_about.title_translators") }}</h2>
                    <p>
                        <Link to="https://hosted.weblate.org/engage/doki-doki-mod-manager/">
                            <i class="fas fa-globe"></i>
                            {{ _("renderer.tab_about.link_weblate") }}
                        </Link>
                    </p>
                    <div class="contributors">
                        <div class="contributor" v-for="translator in translators">
                            <p>{{ translator.name }}</p>
                            <p class="contributor-subtext">{{ translator.language }}</p>
                        </div>
                    </div>
                </template>

                <br>

                <template v-if="v4_beta.length > 0">
                    <h2>{{ _("renderer.tab_about.title_v4_beta") }}</h2>
                    <div class="contributors">
                        <div class="contributor" v-for="tester in v4_beta">
                            <p>{{ tester }}</p>
                        </div>
                    </div>
                </template>
            </template>

            <br>

            <h2>{{ _("renderer.tab_about.title_disclaimer") }}</h2>
            <p>{{ _("renderer.tab_about.disclaimer_1") }}</p>
            <br>
            <p>{{ _("renderer.tab_about.disclaimer_2") }}</p>
        </div>
    </div>
</template>

<script>
import Link from "../elements/Link.vue";

const THANKS_URL = "https://raw.githubusercontent.com/DokiDokiModManager/Meta/master/thanks.json";

export default {
    name: "AboutTab",
    components: {Link},
    data() {
        return {
            supporters: [],
            translators: [],
            v4_beta: [],
            hide_dynamics: ddmm.constants.disable_dynamic_about
        }
    },
    methods: {
        _: ddmm.translate
    },
    mounted() {
        if (ddmm.constants.disable_dynamic_about) return;
        fetch(THANKS_URL).then(res => res.json()).then(thanks => {
            this.supporters = thanks.patreon;
            this.translators = thanks.translations;
            this.v4_beta = thanks.v4_beta;
        });
    }
}
</script>

<style scoped>

</style>
