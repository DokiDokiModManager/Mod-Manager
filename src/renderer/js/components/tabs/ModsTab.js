const ModsTab = Vue.component("ddmm-mods-tab", {
    "template": `
<div class="page-content">
    <div class="mod-viewer-pane">
        <div class="mod-viewer-mod-list">
            <div class="mod-view-mod-list-title">installed</div>
            <div class="mod-view-mod-list-entry" v-for="install in installs">{{install.name}}</div>
            <br>
            <div class="mod-view-mod-list-title">downloaded</div>
            <div class="mod-view-mod-list-entry" v-for="mod in mods">{{mod}}</div>
        </div>
        <div class="mod-viewer-mod-display">
            <h2>Mod Name</h2>
            <p>Installed</p>
        </div>
    </div>
</div>
   `,
    "data": function() {
        return {
            "installs": [],
            "mods": []
        }
    },
    "mounted": function () {
        ddmm.mods.refreshInstallList();
        ddmm.mods.refreshModList();
        ddmm.on("install list", installs => {
            this.installs = installs;
        });
        ddmm.on("mod list", mods => {
           this.mods = mods;
        });
    }
});