<template>
    <AlertDialog
        :title="news.title"
        :modal_id="'news'"
        :button_text="_('renderer.modal_news.button')"
    >
        {{news.body}}
    </AlertDialog>
</template>

<script>
    import AlertDialog from "./base/AlertDialog";

    export default {
        name: "NewsDialog",
        components: {AlertDialog},
        methods: {
            _: ddmm.translate
        },
        data() {
            return {
                news: this.$store.state.news_modal
            }
        }
    }
</script>

<style scoped>

</style>