<template>
    <div class="news-banner">
        <div class="news-banner-content" @click="dismiss">
            {{text}}
        </div>
    </div>
</template>

<script>
    export default {
        name: "NewsBanner",
        computed: {
            text() {
                return this.$store.state.news_banner.body;
            }
        },
        methods: {
            dismiss() {
                let seenNews = [];

                if (localStorage.getItem("seen_news")) {
                    seenNews = localStorage.getItem("seen_news").split(",");
                }

                seenNews.push(this.$store.state.news_banner.id);
                localStorage.setItem("seen_news", seenNews.join(","));
                this.$store.commit("hide_banner");
            }
        }
    }
</script>

<style scoped>

</style>
