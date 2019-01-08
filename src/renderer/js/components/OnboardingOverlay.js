const OnboardingOverlay = Vue.component("ddmm-onboarding", {
    "template": `<div class="cover">
    <h1>{{_("renderer.onboarding.title")}}</h1>
    <p>{{_("renderer.onboarding.description_download")}}</p>
    <br>
    <p><button class="primary" :disabled="downloading" @click="download">{{_("renderer.onboarding.button_download")}}</button> <button class="secondary" :disabled="downloading">{{_("renderer.onboarding.button_choose")}}</button></p>
    <br>
    <p>{{_("renderer.onboarding.heading_why")}}</p>
    <div>{{_("renderer.onboarding.description_why")}}</div>
</div>
    `,
    "data": function () {
        return {
            "downloading": false
        }
    },
    "methods": {
        "_": ddmm.translate,
        "download": function () {
            this.downloading = true;
            ddmm.onboarding.downloadGame();
        }
    }
});