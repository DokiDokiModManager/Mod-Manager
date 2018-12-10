const ModsTab = Vue.component("ddmm-mods-tab", {
    "template": `
<div class="page-content">
    <div class="mod-viewer-pane">
        <div class="mod-viewer-mod-list">
            <div class="mod-view-mod-list-title">{{_("renderer.tab_mods.list.header_new")}}</div>
            <div class="mod-view-mod-list-entry" @click="browseForMod">{{_("renderer.tab_mods.list.link_install_mod")}}</div>
            <div class="mod-view-mod-list-entry">{{_("renderer.tab_mods.list.link_install_vanilla")}}</div>
            <br>
            <div class="mod-view-mod-list-title">{{_("renderer.tab_mods.list.header_installed")}}</div>
            <div 
                :class="{'mod-view-mod-list-entry': true, 'active': selected_item.id === install.folderName && selected_item.type === 'install'}"
                 v-for="install in installs"
                  @dblclick="launchInstall(install.folderName)"
                  @mouseup="handleInstallClick(install.folderName, $event)"
                  :title="getPathToInstall(install.folderName)"
                  >{{install.name}}</div>
            <br>
            <div class="mod-view-mod-list-title">{{_("renderer.tab_mods.list.header_downloaded")}}</div>
            <div
                :class="{'mod-view-mod-list-entry': true, 'active': selected_item.id === mod && selected_item.type === 'mod'}" 
                v-for="mod in mods"
                @mouseup="handleModClick(mod, $event)"
                :title="getPathToMod(mod)"
                >{{mod}}</div>
        </div>
        <div class="mod-viewer-mod-display">
            <div v-if="selected_item.type === 'install' && selectedInstall">
                <h1>{{selectedInstall.name}}</h1>
                <p>{{getPathToInstall(selectedInstall.folderName)}}</p>
                
                <br>
                
                <p><button class="success" @click="launchInstall(selectedInstall.folderName)">{{_("renderer.tab_mods.install.button_launch")}}</button></p>
                
                <br>
                
                <h2>{{_("renderer.tab_mods.install.title_screenshots", selectedInstall.screenshots.length)}}</h2>
                <p>{{_("renderer.tab_mods.install.description_screenshots")}}</p>
                
                <br>
                
                <div class="screenshots">
                    <!--suppress RequiredAttributes, HtmlRequiredAltAttribute -->
                    <img v-for="img in selectedInstall.screenshots" :alt="img" :src="getURLToScreenshot(selectedInstall.folderName, img)" @click="openScreenshot(selectedInstall.folderName, img)" width="150">
                </div>
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
        "browseForMod": ddmm.mods.browseForMod,
        "selectItem": function (id, type) {
            if (this.selected_item.id === id && this.selected_item.type === type) return;
            this.selected_item.id = id;
            this.selected_item.type = type;
            localStorage.setItem("mod_list_last_id", id);
            localStorage.setItem("mod_list_last_type", type);
        },
        "handleInstallClick": function (installFolder, ev) {
            this.selectItem(installFolder, "install");
            if (ev.button === 2) {
                ddmm.window.handleInstallRightClick(installFolder, ev.clientX, ev.clientY);
            }
        },
        "handleModClick": function (filename, ev) {
            this.selectItem(filename, "mod");
            if (ev.button === 2) {
                ddmm.window.handleModRightClick(filename, ev.clientX, ev.clientY);
            }
        },
        "getPathToInstall": function (installFolder) {
            return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", installFolder);
        },
        "getPathToMod": function (mod) {
            return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "mods", mod);
        },
        "getURLToScreenshot": function (installFolder, filename) {
            return ddmm.pathToFile(ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", installFolder, "install", filename)) + "?" + Math.random();
        },
        "openScreenshot": function (installFolder, filename) {
            ddmm.app.showFile(ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", installFolder, "install", filename));
        },
        "launchInstall": function (install) {
            ddmm.mods.launchInstall(install);
        },
        "_refreshInstallList": function (installs) {
            // Event handler for refreshed install list
            this.installs = installs;
        },
        "_refreshModList": function (mods) {
            // Event handler for refreshed mod list
            this.mods = mods;
        },
        "_keyPressHandler": function (e) {
            // Handles key press events for installs / mods
            if (this.selectedInstall) {
                if (e.key === "Enter") {
                    ddmm.mods.launchInstall(this.selectedInstall.folderName);
                }
            }
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
        ddmm.on("install list", this._refreshInstallList);
        ddmm.on("mod list", this._refreshModList);
        document.body.addEventListener("keyup", this._keyPressHandler);
    },
    "destroyed": function () {
        ddmm.off("install list", this._refreshInstallList);
        ddmm.off("mod list", this._refreshModList);
        document.body.removeEventListener("keyup", this._keyPressHandler);
    }
});