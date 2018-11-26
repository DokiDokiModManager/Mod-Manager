/*
    A component representing the home tab
 */
const HomeTab = Vue.component("ddmm-home-tab", {
    "template": `
<div>
    <h1>{{_("home.tab_title")}}</h1>
    <p>{{_("home.tab_subtitle", ddmm_version)}} <a href="javascript:;" @click="$emit('show_modal', 'changelog')">{{_("home.link_changelog")}}</a></p>
    <br>
    <div v-if="lastInstall" class="highlight">
        <h2>{{_("home.section_resume_title")}}</h2>
        <p>{{_("home.section_resume_subtitle", lastInstall.name)}}</p>
        <p><button class="primary" @click="launchInstall(lastInstall.folder)">{{_("home.section_resume_button")}}</button></p>
    </div>
</div>
</div>`,
    "props": ["ddmm_version"],
    "computed": {
        "lastInstall": function() {
            return ddmm.readConfigValue("lastInstall");
        }
    },
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        },
        "launchInstall": ddmm.launchInstall,
        "openURL": ddmm.openURL,
    }
});