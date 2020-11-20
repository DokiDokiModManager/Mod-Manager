<template>
    <Dialog>
        <div style="text-align: center;">
            <br>
            <p><i class="fas fa-spinner fa-spin fa-2x"></i></p>
            <br>
            <h2>{{_("renderer.modal_download_starting.title")}}</h2>
            <br>
            <p>{{_("renderer.modal_download_starting.description")}}</p>
            <br>
        </div>
    </Dialog>
</template>

<script>
    import Dialog from "./base/Dialog";
    import Logger from "../../js/utils/Logger";

    export default {
        name: "DownloadStartingDialog",
        components: {Dialog},
        methods: {
            _: ddmm.translate,
        },
        beforeDestroy() {
            Logger.info("Download Filename", "Removing filename preload");
            ddmm.downloads.preloadFilename(null);
        }
    }
</script>

<style scoped>

</style>
