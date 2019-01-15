const ModsTab = Vue.component("ddmm-mods-tab", {
    "template": `
<div class="page-content">
    <div class="mod-viewer-pane">
        <div class="mod-viewer-mod-list">
            <div><input type="text" class="small" :placeholder="_('renderer.tab_mods.list.placeholder_search')" autofocus @keydown="_searchEscapeHandler" @focus="search = ''" v-model="search"></div>
            <br>
            <div class="mod-view-mod-list-title">{{_("renderer.tab_mods.list.header_new")}}</div>
            <div
                :class="{'mod-view-mod-list-entry': true, 'active': selected_item.type === 'create'}"
                @click="showCreateInstall()">{{_("renderer.tab_mods.list.link_install")}}</div>
            <br>
            <div class="mod-view-mod-list-title" v-if="searchResultsInstalls.length > 0">{{_("renderer.tab_mods.list.header_installed")}}</div>
            <div 
                :class="{'mod-view-mod-list-entry': true, 'active': selected_item.id === install.folderName && selected_item.type === 'install'}"
                 v-for="install in searchResultsInstalls"
                  @dblclick="launchInstall(install.folderName)"
                  @mouseup="handleInstallClick(install.folderName, $event)"
                  :title="getPathToInstall(install.folderName)"
                  >
                  {{install.name}}
            </div>
            <br v-if="searchResultsInstalls.length > 0">
            <div class="mod-view-mod-list-title" v-if="searchResultsMods.length > 0">{{_("renderer.tab_mods.list.header_downloaded")}}</div>
            <div
                :class="{'mod-view-mod-list-entry': true, 'active': selected_item.id === mod.filename && selected_item.type === 'mod', 'disabled': mod.downloading}" 
                v-for="mod in searchResultsMods"
                @mouseup="handleModClick(mod.filename, mod.downloading, $event)"
                @dblclick="showCreateInstall(getPathToMod(mod.filename))"
                :title="getPathToMod(mod.filename)"
                ><i class="fas fa-spinner fa-spin fa-fw" v-if="mod.downloading"></i> {{mod.filename}}</div>
        </div>
        <div class="mod-viewer-mod-display">
            <div v-if="selected_item.type === 'install' && selectedInstall">
                <h1>{{selectedInstall.name}}  <span class="tag" v-if="selectedInstall.globalSave">{{_("renderer.tab_mods.install.tag_global_save")}}</span></h1>
                <p>{{getPathToInstall(selectedInstall.folderName)}}</p>              
                
                <br>
                
                <p><button class="success" @click="launchInstall(selectedInstall.folderName)">{{_("renderer.tab_mods.install.button_launch")}}</button></p>
                
                <br>
                
                <template v-if="selectedInstall.mod && selectedInstall.mod.uses_sdk">
                        <p><strong>{{_("renderer.tab_mods.install.description_sdk")}}</strong></p>
                        
                        <br>
                </template>
                
                <h2>{{_("renderer.tab_mods.install.title_screenshots", selectedInstall.screenshots.length)}}</h2>
                <p>{{_("renderer.tab_mods.install.description_screenshots")}}</p>
                
                <br>
                
                <div class="screenshots">
                    <!--suppress RequiredAttributes, HtmlRequiredAltAttribute -->
                    <img v-for="img in selectedInstall.screenshots" :alt="img" :src="getURLToScreenshot(selectedInstall.folderName, img)" @click="openScreenshot(selectedInstall.folderName, img)" width="150">
                </div>
                
                <br>
                
                <template v-if="selectedInstall.mod">                                    
                    <h2>{{selectedInstall.mod.name}}</h2>
                    <p><strong>{{_("renderer.tab_mods.install.description_author", selectedInstall.mod.author)}}</strong></p>
                    <br>
                    <p>{{selectedInstall.mod.description}}</p>
                    
                    <template v-if="selectedInstall.mod.website || selectedInstall.mod.discord">
                        <br>
                        
                        <p v-if="selectedInstall.mod.website"><a href="javascript:;" @click="openURL(selectedInstall.mod.website)"><i class="fas fa-fw fa-globe"></i> {{_("renderer.tab_mods.install.link_website", selectedInstall.mod.website)}}</a></p>
                        <p v-if="selectedInstall.mod.discord"><a href="javascript:;" @click="openURL('https://discord.gg/' + selectedInstall.mod.discord)"><i class="fab fa-fw fa-discord"></i> {{_("renderer.tab_mods.install.link_discord", "discord.gg/" + selectedInstall.mod.discord)}}</a></p>
                    </template>
                </template>
            </div>
            <div v-else-if="selected_item.type === 'mod'">
                <h1>{{selected_item.id}}</h1>
                <p>{{getPathToMod(selected_item.id)}}</p>
                
                <br>
                
                <p><button class="success" @click="showCreateInstall(getPathToMod(selected_item.id))">{{_("renderer.tab_mods.mod.button_install")}}</button></p>
            </div>
            <div v-else-if="selected_item.type === 'create'">
                <h1>{{_("renderer.tab_mods.install_creation.title")}}</h1>
                
                <p></p>
                
                <div class="form-group">
                    <p><label>{{_("renderer.tab_mods.install_creation.label_install_name")}}</label></p>
                    <p><input type="text" :placeholder="_('renderer.tab_mods.install_creation.label_install_name')" v-model="install_creation.install_name" @keyup="generateInstallFolderName"></p>
                </div>
                
                <div class="form-group">
                    <p><label>{{_("renderer.tab_mods.install_creation.label_folder_name")}}</label></p>
                    <p><input type="text" :placeholder="_('renderer.tab_mods.install_creation.label_folder_name')" v-model="install_creation.folder_name"></p>
                </div>
                
                <div class="form-group">
                    <p><label><input type="checkbox" v-model="install_creation.has_mod"> {{_("renderer.tab_mods.install_creation.label_has_mod")}}</label></p>
                </div>
                
                <div class="form-group" v-if="install_creation.has_mod">
                    <p><label>{{_("renderer.tab_mods.install_creation.label_mod")}}</label></p>
                    <p><input type="text" :placeholder="_('renderer.tab_mods.install_creation.description_mod')" v-model="install_creation.mod" readonly @click="installCreationSelectMod" style="cursor: pointer;"></p>
                </div>
                
                <div class="form-group">
                    <p><label><input type="checkbox" v-model="install_creation.global_save"> {{_("renderer.tab_mods.install_creation.label_global_save")}}</label></p>
                </div>
                
                <p>
                    <strong>{{_("renderer.tab_mods.install_creation.header_summary")}}</strong>
                    <br>
                    <template v-if="install_creation.has_mod">
                        <span v-if="install_creation.global_save">{{_("renderer.tab_mods.install_creation.description_modded_global_save")}}</span>
                        <span v-else>{{_("renderer.tab_mods.install_creation.description_modded")}}</span>
                    </template>
                    <template v-else>
                        <span v-if="install_creation.global_save">{{_("renderer.tab_mods.install_creation.description_vanilla_global_save")}}</span>
                        <span v-else>{{_("renderer.tab_mods.install_creation.description_vanilla")}}</span>
                    </template>
                    
                </p>
                
                
                <div class="form-group"><button class="primary" @click="createInstallSubmit" :disabled="shouldDisableCreation">{{_("renderer.tab_mods.install_creation.button_install")}}</button></div>
                
                <p v-if="!is_installing && install_creation.folder_name.length > 2 && installExists(install_creation.folder_name)">{{_("renderer.tab_mods.install_creation.status_exists")}}</p>
                
                <p v-if="is_installing"><i class="fas fa-spinner fa-spin"></i> {{_("renderer.tab_mods.install_creation.status_installing")}}</p>
            </div>
        </div>
    </div>
</div>
   `,
    "data": function () {
        return {
            "installs": [],
            "mods": [],
            "is_installing": false,
            "selected_item": {
                "id": sessionStorage.getItem("mod_list_last_id"),
                "type": sessionStorage.getItem("mod_list_last_type")
            },
            "install_creation": {
                "install_name": "",
                "folder_name": "",
                "global_save": false,
                "has_mod": false,
                "mod": ""
            },
            "search": "",
            "_fuseMods": null,
            "_fuseInstalls": null
        }
    },
    "methods": {
        "_": ddmm.translate,
        "installExists": ddmm.mods.installExists,
        "browseForMod": ddmm.mods.browseForMod,
        "openURL": ddmm.app.openURL,
        "showCreateInstall": function (mod) {
            if (this.selected_item.type === "create") return;
            this.install_creation.install_name = "";
            this.install_creation.folder_name = "";
            this.install_creation.global_save = false;
            this.install_creation.has_mod = !!mod;
            this.install_creation.mod = mod || "";
            this.selectItem("", "create");
        },
        "selectItem": function (id, type) {
            if (this.selected_item.id === id && this.selected_item.type === type) return;
            this.selected_item.id = id;
            this.selected_item.type = type;
            sessionStorage.setItem("mod_list_last_id", id);
            sessionStorage.setItem("mod_list_last_type", type);
        },
        "handleInstallClick": function (installFolder, ev) {
            this.selectItem(installFolder, "install");
            if (ev.button === 2) {
                ddmm.window.handleInstallRightClick(installFolder, ev.clientX, ev.clientY);
            }
        },
        "handleModClick": function (filename, downloading, ev) {
            if (downloading) return;
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
        "generateInstallFolderName": function () {
            this.install_creation.folder_name = this.install_creation.install_name
                .trim()
                .toLowerCase()
                .replace(/\W/g, "-")
                .replace(/-+/g, "-")
                .substring(0, 32);
        },
        "installCreationSelectMod": function () {
            const mod = ddmm.mods.browseForMod();
            if (mod) {
                this.install_creation.mod = mod;
            }
        },
        "createInstallSubmit": function () {
            if (this.shouldDisableCreation) return;
            this.is_installing = true;
            ddmm.mods.createInstall(this.install_creation.folder_name, this.install_creation.install_name, this.install_creation.global_save, (this.install_creation.has_mod ? this.install_creation.mod : null));
            ddmm.once("install list", () => {
                this.is_installing = false;
                if (this.installs.find(i => i.folderName === this.install_creation.folder_name)) {
                    this.selectItem(this.install_creation.folder_name, "install");
                }
            });
        },
        "_refreshInstallList": function (installs) {
            // Event handler for refreshed install list
            this.installs = installs;

            // select something to avoid leaving a blank area
            if (!this.selected_item.id) {
                if (installs.length > 0) {
                    // select the first install
                    this.selectItem(installs[0].folderName, "install");
                } else {
                    // select the install creation page
                    this.selectItem("", "create");
                }
            }

            this._fuseInstalls = new Fuse(installs, {
                shouldSort: true,
                threshold: 0.5,
                keys: ["name", "folderName", "mod.name"]
            });
        },
        "_refreshModList": function (mods) {
            // Event handler for refreshed mod list
            this.mods = mods;

            this._fuseMods = new Fuse(mods, {
                shouldSort: true,
                threshold: 0.5,
            });
        },
        "_keyPressHandler": function (e) {
            if (!allowKeyEvents()) {
                return;
            }
            // Handles key press events for installs / mods
            if (this.selectedInstall) {
                if (e.key === "Enter") {
                    ddmm.mods.launchInstall(this.selectedInstall.folderName);
                } else if (e.key === "F2") {
                    // TODO rename
                } else if (e.key === "Delete") {
                    ddmm.window.prompt({
                        title: ddmm.translate("renderer.tab_mods.uninstall_confirmation.message"),
                        description: ddmm.translate("renderer.tab_mods.uninstall_confirmation.details"),
                        button_affirmative: ddmm.translate("renderer.tab_mods.uninstall_confirmation.button_affirmative"),
                        button_negative: ddmm.translate("renderer.tab_mods.uninstall_confirmation.button_negative"),
                        callback: (uninstall) => {
                            if (uninstall) {
                                ddmm.mods.deleteInstall(this.selectedInstall.foldeName);
                            }
                        }
                    });
                }
            } else if (this.selected_item.type === "mod") {
                if (e.key === "Enter") {
                    this.showCreateInstall(this.getPathToMod(this.selected_item.id));
                } else if (e.key === "Delete") {
                    // TODO delete
                }
            }
        },
        "_searchEscapeHandler": function (e) {
            if (e.key === "Escape") {
                this.search = "";
            }
        }
    },
    "computed": {
        "selectedInstall": function () {
            return this.installs.find(i => i.folderName === this.selected_item.id);
        },
        "shouldDisableCreation": function () {
            return this.is_installing || (this.install_creation.has_mod && !this.install_creation.mod)
                || this.install_creation.install_name.length < 2 || this.install_creation.folder_name.length < 2
                || ddmm.mods.installExists(this.install_creation.folder_name);
        },
        "searchResultsMods": function () {
            return this.search.length > 0 ? this._fuseMods.search(this.search).map(mod => this.mods[mod]) : this.mods;
        },
        "searchResultsInstalls": function () {
            return this.search.length > 0 ? this._fuseInstalls.search(this.search) : this.installs;
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