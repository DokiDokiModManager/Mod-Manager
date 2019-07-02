const OnboardingOverlay = Vue.component("ddmm-onboarding", {
    "template": `<div class="cover">
    <h1>{{_("renderer.onboarding.title")}}</h1>
    <p>{{_("renderer.onboarding.description_download")}}</p>
    <br>
    <p>{{_("renderer.onboarding.heading_why")}}</p>
    <div>{{_("renderer.onboarding.description_why")}}</div>
    <br>
    <div>{{_("renderer.onboarding.description_platform")}}</div>
    <br>
    <div>{{_("renderer.onboarding.description_unexpected")}}</div>
    <br>
    <div v-if="!downloading">{{_("renderer.onboarding.description_location", install_folder)}} <a href="javascript:;" @click="changeFolder">{{_("renderer.onboarding.link_change")}}</a></div>
    <br>
    <p><button class="primary" @click="open">{{_("renderer.onboarding.button_choose")}}</button> <button class="secondary" @click="download">{{_("renderer.onboarding.button_download")}}</button></p>
   
</div>
    `,
    "data": function () {
        return {
            "install_folder": ddmm.config.readConfigValue("installFolder")
        }
    },
    "methods": {
        "_": ddmm.translate,
        "download": function () {
            ddmm.app.openURL("https://teamsalvato.itch.io/ddlc");
        },
        "open": function () {
            ddmm.onboarding.browseForGame();
        },
        "changeFolder": function () {
            ddmm.app.beginMoveInstall();
        }
    }
});