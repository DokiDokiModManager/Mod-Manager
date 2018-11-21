/*
    A component representing the home tab
 */
const HomeTab = Vue.component("ddmm-home-tab", {
    "template": `
<div>
    <h1>{{_("home.tab_title")}}</h1>
    <p>{{_("home.tab_subtitle", ddmm_version)}}</p>
    <hr>
    <h2>{{_("home.section_resume_title")}}</h2>
    <p>{{_("home.section_resume_subtitle", "MOD_NAME_HERE")}}</p>
    <p><button class="primary">{{_("home.section_resume_button")}}</button></p>
    <hr>
    <h2>{{_("home.section_discover_title")}}</h2>
    <p>{{_("home.section_discover_subtitle")}}</p>
    <br>
    <div class="columns" data-flex-basis="200px">
        <div v-for="mod in recommended_mods" class="column">
            <h3>{{mod.name}}</h3>
            <p><button class="primary">{{_("home.section_discover_button_download")}}</button></p>
            <p>{{mod.description}}</p>
            <p v-if="mod.content_warning" style="color: firebrick;">{{mod.content_warning}}</p>
            <br>
        </div>
    </div>
</div>
</div>`,
    "props": ["recommended_mods", "ddmm_version"],
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        }
    }
});