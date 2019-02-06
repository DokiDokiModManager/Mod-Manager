const DropOverlay = Vue.component("ddmm-drop-overlay", {
    "template": `<div class="drop-overlay">
    <div class="info">
        <p><i class="fas fa-download fa-2x"></i></p>
        <p>{{_("renderer.drop_cover.text")}}</p>
    </div>
</div>`,
    "methods": {
        "_": ddmm.translate
    }
});