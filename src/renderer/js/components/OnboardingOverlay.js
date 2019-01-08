const OnboardingOverlay = Vue.component("ddmm-onboarding", {
    "template": `<div class="cover">
    <h1>{{_("renderer.onboarding.title")}}</h1>
    <p>{{_("renderer.onboarding.description_download")}}</p>
    <br>
    <p><button class="primary">{{_("renderer.onboarding.button_download")}}</button> <button class="secondary">{{_("renderer.onboarding.button_choose")}}</button></p>
    <br>
    <p>{{_("renderer.onboarding.heading_why")}}</p>
    <div>{{_("renderer.onboarding.description_why")}}</div>
</div>
    `,
    "data": function () {
        return {

        }
    },
    "methods": {
        "_": ddmm.translate,
    }
});