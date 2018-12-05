/*
    A component representing the about tab
 */
const ModsTab = Vue.component("ddmm-mods-tab", {
    "template": `
<div>
    <ddmm-modal :title="_('uninstall_modal.title')"
                :visible="modals.uninstall"
                :buttons="[{'id': 'uninstall', 'clazz': 'danger', 'text': _('uninstall_modal.button_uninstall')}, {'id': 'cancel', 'clazz': 'secondary', 'text': _('uninstall_modal.button_cancel')}]"
                @button="handleUninstallButtonClick">
        <p v-if="selectedInstall">{{_("uninstall_modal.description_1", selectedInstall.name)}}</p>
        <br>
        <p>{{_("uninstall_modal.description_2")}}</p>
    </ddmm-modal>
    
    <ddmm-modal :title="_('save_delete_modal.title')"
                :visible="modals.save_delete"
                :buttons="[{'id': 'delete', 'clazz': 'warning', 'text': _('save_delete_modal.button_delete')}, {'id': 'cancel', 'clazz': 'secondary', 'text': _('save_delete_modal.button_cancel')}]"
                @button="handleSaveDeleteButtonClick">
        <p v-if="selectedInstall">{{_("save_delete_modal.description_1", selectedInstall.name)}}</p>
        <br>
        <p>{{_("save_delete_modal.description_2")}}</p>
    </ddmm-modal>
    
    <h1>{{_("mods.tab_title")}}</h1>
    <p>{{_("mods.tab_subtitle")}}</p>
    
    <br>
    
    <ddmm-drop-target @files="handleDroppedFiles" @click="browseForMod"></ddmm-drop-target>
    
    <br>
    
    <p><button class="success" @click="$emit('install_mod', null)">{{_("mods.button_vanilla_install")}}</button> <button class="secondary" @click="refreshList">{{_("mods.button_refresh")}}</button></p>
    
    <br>
    
    <div v-for="install in install_list">
        <h2>{{install.name}} <small>{{install.folderName}}</small></h2>
        <p>
            <span style="cursor: help;" :title="_('mods.install.description_installed')"><i class="fas fa-check fa-fw" style="color: #6ab04c;"></i> {{_("mods.install.status_ready")}}</span>
            <span style="cursor: help;" v-if="install.globalSave" :title="_('mods.install.description_global_save')"> &dash; {{_("mods.install.status_global_save")}}</span>
        </p>
        <p>
            <button class="primary" @click="launchInstall(install.folderName)">{{_("mods.install.button_play")}}</button>
            <button class="secondary">{{_("mods.install.button_rename")}}</button>
            <button class="secondary" @click="createShortcut(install.folderName)">{{_("mods.install.button_shortcut")}}</button>
            <button class="warning" @click="deleteSave(install.folderName)">{{_("mods.install.button_delete_save")}}</button>
            <button class="danger" @click="uninstall(install.folderName)">{{_("mods.install.button_uninstall")}}</button>
        </p>
        <br>
    </div>
    <div v-for="mod in mod_list">
        <h2>{{mod}}</h2>
        <p><span style="cursor: help;" :title="_('mods.mod.description_downloaded')"><i class="fas fa-download fa-fw" style="color: #f0932b;"></i> {{_("mods.mod.status_downloaded")}}</span></p>
        <p>
            <button class="primary" @click="$emit('install_mod', getCanonicalPathToMod(mod))">{{_("mods.mod.button_install")}}</button>
            <button class="danger">delete</button>
        </p>
        <br>
    </div>
</div>`,
    "props": ["ddmm_version", "mod_list", "install_list"],
    "data": function () {
        return {
            "selected_install": null,
            "modals": {
                "uninstall": false,
                "save_delete": false
            }
        }
    },
    "computed": {
        "selectedInstall": function () {
            return this.install_list.find(i => i.folderName === this.selected_install);
        }
    },
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        },
        "launchInstall": ddmm.launchInstall,
        "createShortcut": ddmm.createShortcut,
        "openURL": ddmm.openURL,
        "handleDroppedFiles": function (files) {
            const filePath = files[0].path;
            console.log(filePath);
            if (filePath) {
                if (isArchive(filePath)) {
                    this.$emit("install_mod", filePath);
                } else {
                    // TODO: error message
                }
            }
        },
        "browseForMod": function () {
            const files = ddmm.browseForMod();
            if (files && files[0]) {
                const filePath = files[0];

                if (filePath) {
                    if (isArchive(filePath)) {
                        this.$emit("install_mod", filePath);
                    } else {
                        // TODO: error message
                    }
                }
            }
        },
        "refreshList": function () {
            ddmm.refreshInstallList();
            ddmm.refreshModList();
        },
        "getCanonicalPathToMod": function (filename) {
            return ddmm.joinPath(ddmm.readConfigValue("installFolder"), "mods", filename);
        },
        "uninstall": function (folderName) {
            this.selected_install = folderName;
            this.modals.uninstall = true;
        },
        "deleteSave": function (folderName) {
            this.selected_install = folderName;
            this.modals.save_delete = true;
        },
        "handleUninstallButtonClick": function (button) {
            if (button === "uninstall") {
                ddmm.deleteInstall(this.selected_install);
            }
            this.modals.uninstall = false;
        },
        "handleSaveDeleteButtonClick": function (button) {
            if (button === "delete") {
                ddmm.deleteSaveData(this.selected_install);
            }
            this.modals.save_delete = false;
        }
    }
});

function isArchive(filename) {
    return ["zip", "rar", "7z", "gz"].filter(ext => filename.endsWith("." + ext)).length > 0;
}