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
                  @mouseup="handleInstallClick(install.folderName, install.name, $event)"
                  :title="getPathToInstall(install.folderName)"
                  >
                  <span>{{install.name}}</span>
                  <span class="mod-view-mod-list-entry-button" @click="handleInstallSettingsClick(install.folderName, install.name, $event)"><i class="fas fa-cog"></i></span>
            </div>
            <br v-if="searchResultsInstalls.length > 0">
            <div class="mod-view-mod-list-title" v-if="searchResultsMods.length > 0">{{_("renderer.tab_mods.list.header_downloaded")}}</div>
            <div
                :class="{'mod-view-mod-list-entry': true, 'active': selected_item.id === mod.filename && selected_item.type === 'mod', 'disabled': mod.downloading}" 
                v-for="mod in searchResultsMods"
                @mouseup="handleModClick(mod.filename, mod.downloading, $event)"
                @dblclick="showCreateInstall(getPathToMod(mod.filename))"
                :title="getPathToMod(mod.filename)"
                >
                <span><i class="fas fa-spinner fa-spin fa-fw" v-if="mod.downloading"></i> {{mod.filename}}</span>
                <span class="mod-view-mod-list-entry-button" @click="handleModSettingsClick(mod.filename, $event)"><i class="fas fa-cog"></i></span>
                </div>
        </div>
        <div class="mod-viewer-mod-display">
            <div v-if="selected_item.type === 'install' && selectedInstall">
                
            </div>
            <div v-else-if="selected_item.type === 'mod'">
                
            </div>
            <div v-else-if="selected_item.type === 'create'">
                
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
                "id": "",
                "type": ""
            },
            "install_creation": {
                "install_name": "",
                "folder_name": "",
                "has_mod": false,
                "mod": "",
                "save_option": 0,
                "cloudsave": ""
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
        "isSaveLocked": function (fn) {
            console.log(fn);
            return isSaveLocked(fn);
        },
        "showCreateInstall": function (mod) {
            this.install_creation.has_mod = !!mod;
            this.install_creation.mod = mod || "";
            if (this.selected_item.type === "create") return;
            this.install_creation.install_name = "";
            this.install_creation.folder_name = "";
            this.install_creation.save_option = 0;
            this.install_creation.cloudsave = "";
            this.selectItem("", "create");
        },
        "selectItem": function (id, type) {
            if (this.selected_item.id === id && this.selected_item.type === type) return;
            this.selected_item.id = id;
            this.selected_item.type = type;
            sessionStorage.setItem("mod_list_last_id", id);
            sessionStorage.setItem("mod_list_last_type", type);
        },
        "handleInstallClick": function (installFolder, installName, ev) {
            this.selectItem(installFolder, "install");
            if (ev.button === 2) {
                ddmm.window.handleInstallRightClick(installFolder, installName, ev.clientX, ev.clientY);
            }
        },
        "handleInstallSettingsClick": function (installFolder, installName, ev) {
            ddmm.window.handleInstallRightClick(installFolder, installName, ev.clientX, ev.clientY);
        },
        "handleModClick": function (filename, downloading, ev) {
            if (downloading) return;
            this.selectItem(filename, "mod");
            if (ev.button === 2) {
                ddmm.window.handleModRightClick(filename, ev.clientX, ev.clientY);
            }
        },
        "handleModSettingsClick": function (filename, ev) {
            ddmm.window.handleModRightClick(filename, ev.clientX, ev.clientY);
        },
        "getPathToInstall": function (installFolder) {
            return ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", installFolder);
        },
        "getPathToMod": function (mod) {
            return ddmm.isAbsolute(mod) ? mod : ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "mods", mod);
        },
        "getURLToScreenshot": function (installFolder, filename) {
            return ddmm.pathToFile(ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", installFolder, "install", filename)) + "?" + Math.random();
        },
        "openScreenshot": function (installFolder, filename) {
            ddmm.app.showFile(ddmm.joinPath(ddmm.config.readConfigValue("installFolder"), "installs", installFolder, "install", filename));
        },
        "openFolder": function (folder) {
            ddmm.app.showFile(folder);
        },
        "launchInstall": function (install) {
            const installData = this.installs.find(i => i.folderName === install);
            if (!installData) return;
            if (installData.cloudSave) {
                testConnection().then(() => {
                    if (isSaveLocked(installData.cloudSave)) {
                        ddmm.window.prompt({
                            title: ddmm.translate("renderer.tab_mods.launch_lock_confirmation.message"),
                            description: ddmm.translate("renderer.tab_mods.launch_lock_confirmation.details"),
                            affirmative_style: "danger",
                            button_affirmative: ddmm.translate("renderer.tab_mods.launch_lock_confirmation.button_affirmative"),
                            button_negative: ddmm.translate("renderer.tab_mods.launch_lock_confirmation.button_negative"),
                            callback: (launch) => {
                                if (launch) {
                                    ddmm.mods.launchInstall(install);
                                }
                            }
                        });
                    } else if (!firebase.auth().currentUser) {
                        ddmm.window.prompt({
                            title: ddmm.translate("renderer.tab_mods.launch_noauth_confirmation.message"),
                            description: ddmm.translate("renderer.tab_mods.launch_noauth_confirmation.details"),
                            affirmative_style: "danger",
                            button_affirmative: ddmm.translate("renderer.tab_mods.launch_noauth_confirmation.button_affirmative"),
                            button_negative: ddmm.translate("renderer.tab_mods.launch_noauth_confirmation.button_negative"),
                            callback: (launch) => {
                                if (launch) {
                                    ddmm.mods.launchInstall(install);
                                }
                            }
                        });
                    } else {
                        ddmm.mods.launchInstall(install);
                    }
                }).catch(() => {
                    ddmm.window.prompt({
                        title: ddmm.translate("renderer.tab_mods.launch_offline_confirmation.message"),
                        description: ddmm.translate("renderer.tab_mods.launch_offline_confirmation.details"),
                        affirmative_style: "danger",
                        button_affirmative: ddmm.translate("renderer.tab_mods.launch_offline_confirmation.button_affirmative"),
                        button_negative: ddmm.translate("renderer.tab_mods.launch_offline_confirmation.button_negative"),
                        callback: (launch) => {
                            if (launch) {
                                ddmm.mods.launchInstall(install);
                            }
                        }
                    });
                });
            } else {
                ddmm.mods.launchInstall(install);
            }
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

            let cloudSave = null;

            if (this.install_creation.save_option === 2 && this.install_creation.cloudsave === "") {
                cloudSave = createCloudSave(this.install_creation.install_name);
            } else {
                cloudSave = this.install_creation.cloudsave;
            }

            ddmm.mods.createInstall({
                folderName: this.install_creation.folder_name,
                installName: this.install_creation.install_name,
                globalSave: this.install_creation.save_option === 1,
                cloudSave: (this.install_creation.save_option === 2 ? cloudSave : null),
                mod: (this.install_creation.has_mod ? this.install_creation.mod : null)
            });
            ddmm.once("install list", () => {
                this.is_installing = false;
                if (this.installs.find(i => i.folderName === this.install_creation.folder_name)) {
                    this.selectItem(this.install_creation.folder_name, "install");
                }
            });
        },
        "promptDeleteMod": function () {
            ddmm.window.prompt({
                title: ddmm.translate("renderer.tab_mods.mod_delete_confirmation.message"),
                description: ddmm.translate("renderer.tab_mods.mod_delete_confirmation.details"),
                affirmative_style: "danger",
                button_affirmative: ddmm.translate("renderer.tab_mods.mod_delete_confirmation.button_affirmative"),
                button_negative: ddmm.translate("renderer.tab_mods.mod_delete_confirmation.button_negative"),
                callback: (del) => {
                    if (del) {
                        ddmm.mods.deleteMod(this.selected_item.id);
                        this.selectItem(null, "create");
                    }
                }
            });
        },
        "_refreshInstallList": function (installs) {
            // Event handler for refreshed install list
            this.installs = installs;

            // select something to avoid leaving a blank area
            if (!this.selected_item.type) {
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
                keys: ["filename"]
            });
        },
        "_keyPressHandler": function (e) {
            if (!allowKeyEvents()) {
                return;
            }
            // Handles key press events for installs / mods
            if (this.install) {
                if (e.key === "Enter") {
                    this.launchInstall(this.install.folderName);
                } else if (e.key === "F2") {
                    ddmm.window.input({
                        title: ddmm.translate("renderer.tab_mods.rename_input.message"),
                        description: ddmm.translate("renderer.tab_mods.rename_input.details", this.install.name),
                        button_affirmative: ddmm.translate("renderer.tab_mods.rename_input.button_affirmative"),
                        button_negative: ddmm.translate("renderer.tab_mods.rename_input.button_negative"),
                        callback: (newName) => {
                            if (newName) {
                                ddmm.mods.renameInstall(this.install.folderName, newName);
                            }
                        }
                    });
                } else if (e.key === "Delete") {
                    ddmm.window.prompt({
                        title: ddmm.translate("renderer.tab_mods.uninstall_confirmation.message"),
                        description: ddmm.translate("renderer.tab_mods.uninstall_confirmation.details", this.install.name),
                        affirmative_style: "danger",
                        button_affirmative: ddmm.translate("renderer.tab_mods.uninstall_confirmation.button_affirmative"),
                        button_negative: ddmm.translate("renderer.tab_mods.uninstall_confirmation.button_negative"),
                        callback: (uninstall) => {
                            if (uninstall) {
                                ddmm.mods.deleteInstall(this.install.folderName);
                                ddmm.emit("create install");
                            }
                        }
                    });
                }
            } else if (this.selected_item.type === "mod") {
                if (e.key === "Enter") {
                    this.showCreateInstall(this.getPathToMod(this.selected_item.id));
                } else if (e.key === "Delete") {
                    this.promptDeleteMod();
                }
            }
        },
        "searchEscapeHandler": function (e) {
            if (e.key === "Escape") {
                this.search = "";
            }
        },
        "getSaveFiles": function () {
            if (!saves) return;
            return Object.keys(saves).map(filename => {
                return {
                    filename: filename,
                    display: saves[filename].name
                }
            });
        }
    },
    "computed": {
        "install": function () {
            return this.installs.find(i => i.folderName === this.selected_item.id);
        },
        "shouldDisableCreation": function () {
            return this.is_installing || (this.install_creation.has_mod && !this.install_creation.mod)
                || this.install_creation.install_name.length < 2 || this.install_creation.folder_name.length < 2
                || ddmm.mods.installExists(this.install_creation.folder_name);
        },
        "searchResultsMods": function () {
            return this.search.length > 0 ? this._fuseMods.search(this.search) : this.mods;
        },
        "searchResultsInstalls": function () {
            return this.search.length > 0 ? this._fuseInstalls.search(this.search) : this.installs;
        },
        "hasFreeSpace": function () {
            return ddmm.app.getDiskSpace() > 2147483648; // 2 GiB
        }
    },
    "mounted": function () {
        ddmm.mods.refreshInstallList();
        ddmm.mods.refreshModList();
        ddmm.on("install list", this._refreshInstallList);
        ddmm.on("mod list", this._refreshModList);
        ddmm.on("create install", (mod) => {
            this.showCreateInstall(mod ? this.getPathToMod(mod) : null);
        });
        if (!this.selected_item.type) {
            this.selected_item.id = sessionStorage.getItem("mod_list_last_id");
            this.selected_item.type = sessionStorage.getItem("mod_list_last_type");
        }
        document.body.addEventListener("keyup", this._keyPressHandler);
    },
    "destroyed": function () {
        ddmm.off("install list", this._refreshInstallList);
        ddmm.off("mod list", this._refreshModList);
        document.body.removeEventListener("keyup", this._keyPressHandler);
    }
});