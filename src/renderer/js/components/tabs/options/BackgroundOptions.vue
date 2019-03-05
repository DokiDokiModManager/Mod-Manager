<template>
    <div>
        <h1>{{_("renderer.tab_options.section_backgrounds.title")}}</h1>
        <p>{{_("renderer.tab_options.section_backgrounds.subtitle")}}</p>

        <br>

        <div class="screenshots">
            <!--suppress RequiredAttributes, HtmlRequiredAltAttribute -->
            <img v-for="img in backgrounds" :alt="img" :src="'../images/backgrounds/' + img" width="150"
                 @click="setBackground(img)">
        </div>

        <br>

        <button class="danger" @click="setBackground('none')"><i class="fas fa-times fa-fw"></i>
            {{_("renderer.tab_options.section_backgrounds.button_none")}}
        </button>

        <br><br>

        <p>{{_("renderer.tab_options.section_backgrounds.description_credit")}}</p>
    </div>
</template>

<script>
    export default {
        name: "BackgroundOptions",
        methods: {
            _: ddmm.translate,
            setBackground(background) {
                this.$store.commit("options", {background});
            }
        },
        data() {
            return {
                backgrounds: ddmm.app.getBackgrounds()
            }
        }
    }
</script>

<style scoped>

</style>