const StorePlaceholderTab = Vue.component("ddmm-store-placeholder-tab", {
    "template": `
<div class="page-content">
    <div class="text-container">
        <h1>{{_("renderer.tab_store_placeholder.title")}}</h1>
        <p>{{_("renderer.tab_store_placeholder.description_1")}}</p>
        <br>
        <p>{{_("renderer.tab_store_placeholder.description_2")}}</p>
        <br>
        <div v-for="mod in mods">
            <h3>{{mod.name}}</h3>
            <p><strong>{{mod.author}}</strong></p>
            <p>{{mod.description}}</p>
            <p v-if="mod.content_warning"><i>{{mod.content_warning}}</i></p>
            <br>
            <p><button class="primary"><i class="fas fa-download"></i> {{_("renderer.tab_store_placeholder.button_download")}}</button></p>
            <br>
        </div>
    </div>
</div>
        `,
    "data": function () {
        return {
           "mods": []
        }
    },
    "methods": {
        "_": ddmm.translate
    },
    "mounted": function () {
        fetch("https://raw.githubusercontent.com/DokiDokiModManager/FeaturedMods/master/mods.json").then(r => r.json()).then(mods => {
            this.mods = mods;
            this.$forceUpdate();
        });
    }
});