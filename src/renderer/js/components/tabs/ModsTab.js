const ModsTab = Vue.component("ddmm-mods-tab", {
    "template": `
<div class="page-content">
    <div class="mod-viewer-pane">
        <div class="mod-viewer-mod-list">
            <div class="mod-view-mod-list-title">{{_("renderer.tab_mods.list.header_installed")}}</div>
            <div :class="{'mod-view-mod-list-entry': true, 'active': selected_item.id === install.folderName && selected_item.type === 'install'}" v-for="install in installs" @click="selectItem(install.folderName, 'install')" @mouseup="handleInstallRightClick(install.folderName, $event)">{{install.name}}</div>
            <br>
            <div class="mod-view-mod-list-title">{{_("renderer.tab_mods.list.header_downloaded")}}</div>
            <div :class="{'mod-view-mod-list-entry': true, 'active': selected_item.id === mod && selected_item.type === 'mod'}" v-for="mod in mods" @click="selectItem(mod, 'mod')">{{mod}}</div>
        </div>
        <div class="mod-viewer-mod-display">
            <div v-if="selected_item.type === 'install' && selectedInstall">
                <h1>{{selectedInstall.name}}</h1>
                <p>{{getPathToInstall(selectedInstall.folderName)}}</p>
                
                <br>
                
                <p><button class="success" @click="launchInstall(selectedInstall.folderName)">{{_("renderer.tab_mods.mod.button_launch")}}</button></p>
            </div>
            <div v-else-if="selected_item.type === 'mod'">
                <h1>{{selected_item.id}}</h1>
                <p>{{getPathToMod(selected_item.id)}}</p>
            </div>
        </div>
    </div>
</div>
   `,
    "data": function () {
        return {
            "installs": [],
            "mods": [],
            "selected_item": {
                "id": localStorage.getItem("mod_list_last_id"),
                "type": localStorage.getItem("mod_list_last_type")
            }
        }
    },
    "methods": {
        "_": ddmm.translate,
        "selectItem": function (id, type) {
            this.selected_item.id = id;
            this.selected_item.type = type;
            localStorage.setItem("mod_list_last_id", id);
            localStorage.setItem("mod_list_last_type", type);
        },
        "handleInstallRightClick": function (installFolder, ev) {
            if (ev.button === 2) {
                ddmm.window.handleInstallRightClick(installFolder, ev.clientX, ev.clientY);
            }
        },
        "getPathToInstall": function (installFolder) {
            return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", installFolder);
        },
        "getPathToMod": function (mod) {
            return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "mods", mod);
        },
        "launchInstall": function (install) {
            ddmm.mods.launchInstall(install);
        }
    },
    "computed": {
        "selectedInstall": function () {
            return this.installs.find(i => i.folderName === this.selected_item.id);
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