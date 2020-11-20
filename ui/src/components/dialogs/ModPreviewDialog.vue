<template>
    <AlertDialog
            :modal_id="'mod_preview'"
            :title="mod.name"
            :button_text="_('renderer.modal_mod_preview.button_close')"
    >
        <p><strong>{{mod.shortDescription}}</strong></p>
        <br>
        <div>
            <i class="fas fa-star"></i> <strong>{{mod.rating}}</strong>
            &nbsp;
            <i class="fas fa-clock"></i> <strong>{{mod.lengthString}}</strong>
            &nbsp;
            <i class="fas fa-clock"></i> <strong>{{mod.status}}</strong>
            &nbsp;

        </div>
        <br>
        <template v-if="ddlChecked">
        <p v-if="ddl">
            <button class="success" @click="download(ddl)"><i class="fas fa-download fa-fw"></i>
                {{_("renderer.modal_mod_preview.button_download_direct")}}
            </button>
            <button class="secondary" @click="downloadExternal"><i class="fas fa-external-link-alt fa-fw"></i>
                {{_("renderer.modal_mod_preview.button_download_external")}}
            </button>
        </p>
        <p v-else>
            <button class="success" @click="downloadExternal"><i class="fas fa-external-link-alt fa-fw"></i>
                {{_("renderer.modal_mod_preview.button_download_external")}}
            </button>
        </p>
        </template>
        <template v-else>
            <p><i class="fas fa-spinner fa-spin"></i> {{_("renderer.modal_mod_preview.text_loading")}}</p>
        </template>
        <template v-if="debug">
            <br>
            <p><button class="danger" @click="download(mod.downloadURL)"><i class="fas fa-download fa-fw"></i> Download (URL provided)</button></p>
        </template>
        <br>
        <div style="white-space: pre-line; overflow: auto; max-height: 200px;">{{mod.description}}</div>
    </AlertDialog>
</template>

<script>
    import AlertDialog from "./base/AlertDialog";
    import Logger from "../../js/utils/Logger";
    import StarRating from "../elements/StarRating";

    export default {
        name: "ModPreviewDialog",
        components: {StarRating, AlertDialog},
        data() {
            return {
                ddlChecked: false,
                ddl: null,
                debug: !!ddmm.env.DDMM_DEVELOPER
            }
        },
        methods: {
            _: ddmm.translate,
            downloadExternal() {
                ddmm.shell.openURL(this.mod.downloadURL);
            },
            download(url) {
                this.$store.commit("hide_modal", {modal: "mod_preview"});
                this.$store.commit("show_modal", {modal: "download_starting"});
                ddmm.downloads.downloadWithInteraction(url);
            }
        },
        computed: {
            mod() {
                return this.$store.state.mod_preview;
            }
        },
        mounted() {
            Logger.info("Download Filename", "Preloading filename: " + this.mod.name);
            ddmm.downloads.preloadFilename(this.mod.name);
            this.mod.store.testDDL(this.mod.id).then(res => {
                this.ddlChecked = true;
                this.ddl = res.directDownload;
            });
        }
    }
</script>

<style scoped>

</style>
