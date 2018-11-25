/*
    A component representing the about tab
 */
const ModsTab = Vue.component("ddmm-mods-tab", {
    "template": `
<div>
    <h1>{{_("mods.tab_title")}}</h1>
    <p>{{_("mods.tab_subtitle")}}</p>
    
    <br>
    
    <ddmm-drop-target @files="handleDroppedFiles" @click="browseForMod"></ddmm-drop-target>
    
    <br>
    
    <div v-for="install in install_list">
        <h2>{{install.name}} <small>{{install.folderName}}</small></h2>
        <p style="cursor: help;">
            <span :title="_('mods.install.description_installed')"><i class="fas fa-check fa-fw" style="color: #6ab04c;"></i> {{_("mods.install.status_ready")}}</span>
            <span v-if="install.globalSave" :title="_('mods.install.description_global_save')"> &dash; {{_("mods.install.status_global_save")}}</span>
        </p>
        <p><button class="primary" @click="launchInstall(install.folderName)">{{_("mods.install.button_play")}}</button></p>
        <br>
    </div>
    <div v-for="mod in mod_list">
        <h2>{{mod}}</h2>
        <p style="cursor: help;" :title="_('mods.mod.description_downloaded')"><i class="fas fa-download fa-fw" style="color: #f0932b;"></i> {{_("mods.mod.status_downloaded")}}</p>
        <p><button class="primary">{{_("mods.mod.button_install")}}</button></p>
        <br>
    </div>
</div>`,
    "props": ["ddmm_version", "mod_list", "install_list"],
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        },
        "launchInstall": ddmm.launchInstall,
        "openURL": ddmm.openURL,
        "handleDroppedFiles": function (files) {
            console.log(files);
        },
        "browseForMod": ddmm.browseForMod
    }
});