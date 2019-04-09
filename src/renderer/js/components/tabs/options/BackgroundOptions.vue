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

        <p>
            <button class="success" @click="chooseBackground" v-if="user && user.donated"><i class="fas fa-image fa-fw"></i>
                {{_("renderer.tab_options.section_backgrounds.button_custom")}}
            </button>

            <button class="danger" @click="setBackground('none')"><i class="fas fa-times fa-fw"></i>
                {{_("renderer.tab_options.section_backgrounds.button_none")}}
            </button>
        </p>

        <br>

        <p>{{_("renderer.tab_options.section_backgrounds.description_credit")}}</p>

        <br>

        <p v-if="user && user.donated">{{_("renderer.tab_options.section_backgrounds.description_custom")}}</p>
    </div>
</template>

<script>
    export default {
        name: "BackgroundOptions",
        computed: {
            user() {
                return this.$store.state.user;
            }
        },
        methods: {
            _: ddmm.translate,
            setBackground(background) {
                this.$store.commit("options", {background});
            },
            chooseBackground() {
                const el = document.createElement("input");
                el.type = "file";
                el.accept = "image/*";
                el.onchange = () => {
                    console.log(el.files[0]);
                    this.$store.commit("options", {background: "custom:" + el.files[0].path});
                };
                el.click();
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