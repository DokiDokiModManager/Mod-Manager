const DropOverlay = Vue.component("ddmm-drop-overlay", {
    "template": `<div class="drop-overlay" @dragend="end" @dragexit="end" @dragleave="end" @drop="drop" @dragover="start">
    <div class="info">
        <p><i class="fas fa-download fa-2x"></i></p>
        <p>{{_("renderer.drop_cover.text")}}</p>
    </div>
</div>`,
    "methods": {
        "_": ddmm.translate,
        "start": function (ev) {
            ev.dataTransfer.dropEffect = "copy";
            ev.preventDefault();
        },
        "end": function () {
            this.$emit("end");
        },
        "drop": function (ev) {
            ev.preventDefault();
            if (ev.dataTransfer.files && ev.dataTransfer.files[0] && ["zip", "rar", "7z"].filter(ext => ev.dataTransfer.files[0].path.endsWith("." + ext)).length > 0) {
                const file = ev.dataTransfer.files[0].path;
                this.$emit("file", file);
            }
            this.$emit("end");
        }
    }
});