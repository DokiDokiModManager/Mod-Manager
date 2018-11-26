/*
    A component representing the settings tab
 */
const SettingsTab = Vue.component("ddmm-settings-tab", {
    "template": `
<div>
    <h1>{{_("settings.tab_title")}}</h1>
    <p>{{_("settings.tab_subtitle")}}</p>
    <br>
    
    <div class="highlight">
        <h2>{{_("settings.purist_title")}}</h2>
        <p>{{_("settings.purist_description")}}</p>
        <p>
            <button class="primary" v-if="!purist" @click="setPuristMode(true)">{{_("settings.purist_button_enable")}}</button>
            <button v-else class="primary" @click="setPuristMode(false)">{{_("settings.purist_button_disable")}}</button>
        </p>
    </div>
</div>
        `,
    "props": ["ddmm_version"],
    "computed": {
        "purist": () => !!ddmm.readConfigValue("puristMode")
    },
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        },
        "setPuristMode": function (on) {
            ddmm.saveConfigValue("puristMode", on);
            ddmm.restart();
        }
    }
});