/*
    A component representing the about tab
 */
const ModsTab = Vue.component("ddmm-mods-tab", {
    "template": `
<div>
    <h1>{{_("mods.tab_title")}}</h1>
    <p>untranslated yoikes</p>
    <hr>
    <div v-for="install in install_list">
        <h3>{{install.name}}</h3>
        <p><i class="fas fa-check fa-fw" style="color: green"></i> ready to play</p>
        <p><button class="primary">play</button></p>
        <br>
    </div>
    <div v-for="mod in mod_list">
        <h3>{{mod}}</h3>
        <p><i class="fas fa-download fa-fw" style="color: orange"></i> downloaded</p>
        <p><button class="primary">install</button></p>
        <br>
    </div>
</div>`,
    "props": ["ddmm_version", "mod_list", "install_list"],
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        },
        "openURL": ddmm.openURL
    }
});