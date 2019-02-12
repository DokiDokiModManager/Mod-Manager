const StorePlaceholderTab = Vue.component("ddmm-store-placeholder-tab", {
    "template": `
<div class="page-content">
    <div class="text-container">
        <h1>{{_("renderer.tab_store_placeholder.title")}}</h1>
        <p>{{_("renderer.tab_store_placeholder.description_1")}}</p>
        <br>
        <p>{{_("renderer.tab_store_placeholder.description_2")}}</p>
        <template v-if="error">
            <br>
            <strong>{{_("renderer.tab_store_placeholder.error")}}</strong>
        </template>
        <br>
        <div v-for="mod in mods">
            <h3>{{mod.name}}</h3>
            <p><strong>{{mod.author}}</strong></p>
            <p>{{mod.description}}</p>
            <p v-if="mod.content_warning"><i>{{mod.content_warning}}</i></p>
            <br>
            <p><button class="primary" :disabled="isAlreadyDownloaded(mod.url)" @click="downloadMod(mod.url)"><i class="fas fa-download"></i> {{_("renderer.tab_store_placeholder.button_download")}}</button></p>
            <br>
        </div>
    </div>
</div>
        `,
    "data": function () {
        return {
            "mods": [],
            "error": false
        }
    },
    "methods": {
        "_": ddmm.translate,
        "isAlreadyDownloaded": function (url) {
            let rawDownloaded = sessionStorage.getItem("featured_mods_downloaded_this_session");
            if (rawDownloaded) {
                let downloaded = JSON.parse(rawDownloaded);
                return downloaded.indexOf(url) !== -1;
            }
            return false;
        },
        "downloadMod": function (url) {
            let rawDownloaded = sessionStorage.getItem("featured_mods_downloaded_this_session");
            if (rawDownloaded) {
                let downloaded = JSON.parse(rawDownloaded);
                if (downloaded.indexOf(url) !== -1) {
                    return;
                }
                downloaded.push(url);
                sessionStorage.setItem("featured_mods_downloaded_this_session", JSON.stringify(downloaded));
            } else {
                sessionStorage.setItem("featured_mods_downloaded_this_session", JSON.stringify([url]))
            }

            this.$forceUpdate();

            ddmm.mods.download(url);
        }
    },
    "mounted": function () {
        fetch("https://raw.githubusercontent.com/DokiDokiModManager/FeaturedMods/master/mods.json").then(r => r.json()).then(mods => {
            this.mods = mods;
            this.$forceUpdate();
        }).catch(() => {
            this.error = true;
        });
    }
});