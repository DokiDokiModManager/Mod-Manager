const OnboardingOverlay = Vue.component("ddmm-onboarding", {
    "template": `<div class="cover">
    <h1>{{_("renderer.onboarding.title")}}</h1>
    <p>{{_("renderer.onboarding.description_download")}}</p>
    <br>
    <p>{{_("renderer.onboarding.heading_step", 1)}}</p>
    <div>{{_("renderer.onboarding.s1_desc")}}</div>
    <div>{{_("renderer.onboarding.s1_platform", platform === "darwin" ? "Mac" : "Windows")}}</div>
    <br>
    <button class="primary" @click="download">{{_("renderer.onboarding.button_download")}}</button>
    <br><br>
    <p>{{_("renderer.onboarding.heading_step", 2)}}</p>
    <div>{{_("renderer.onboarding.s2_desc")}}</div>
    <br>
    <p><button class="primary" @click="open">{{_("renderer.onboarding.button_choose")}}</button></p>
    <br><br>
    <div>{{_("renderer.onboarding.description_location", install_folder)}} <a href="javascript:;" @click="changeFolder">{{_("renderer.onboarding.link_change")}}</a><br><br></div>
</div>
    `,
    "data": function () {
        return {
            "install_folder": ddmm.config.readConfigValue("installFolder"),
            "platform": ddmm.platform
        }
    },
    "methods": {
        "_": ddmm.translate,
        "download": function () {
            ddmm.app.openURL("https://ddlc.moe");
        },
        "open": function () {
            ddmm.onboarding.browseForGame();
        },
        "changeFolder": function () {
            ddmm.app.beginMoveInstall();
        }
    }
});