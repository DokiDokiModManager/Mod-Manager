/*
    A component representing the home tab
 */
const HomeTab = Vue.component("ddmm-home-tab", {
    "template": `
<div>
    <h1>{{_("home.tab_title")}}</h1>
    <p>{{_("home.tab_subtitle", ddmm_version)}} <a href="javascript:;" @click="$emit('show_modal', 'changelog')">{{_("home.link_changelog")}}</a></p>
    <br>
    <h2>{{_("home.section_resume_title")}}</h2>
    <p>{{_("home.section_resume_subtitle", "MOD_NAME_HERE")}}</p>
    <p><button class="primary">{{_("home.section_resume_button")}}</button></p>
</div>
</div>`,
    "props": ["ddmm_version"],
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        },
        "openURL": ddmm.openURL,
    }
});