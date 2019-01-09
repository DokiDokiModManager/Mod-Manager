const OnboardingOverlay = Vue.component("ddmm-onboarding", {
    "template": `<div class="cover">
    <h1>{{_("renderer.onboarding.title")}}</h1>
    <p>{{_("renderer.onboarding.description_download")}}</p>
    <br>
    <p><button class="primary" :disabled="downloading" @click="download">{{_("renderer.onboarding.button_download")}}</button> <button class="secondary" :disabled="downloading">{{_("renderer.onboarding.button_choose")}}</button></p>
    <br>
    <p>{{_("renderer.onboarding.heading_why")}}</p>
    <div>{{_("renderer.onboarding.description_why")}}</div>
    <br>
    <div v-if="downloading">
        <div class="progress">
            <div class="bar" :style="{'width': formattedPercentage}"></div>
        </div>
        <br>
        <div>{{_("renderer.onboarding.status_downloading", formattedPercentage, download_speed)}}</div>
    </div>
</div>
    `,
    "data": function () {
        return {
            "downloading": false,
            "percentage": 0,
            "download_speed": 0
        }
    },
    "computed": {
      "formattedPercentage": function () {
          return this.percentage + "%";
      }
    },
    "methods": {
        "_": ddmm.translate,
        "_progressCallback": function (progressData) {
            if (progressData.meta !== "ONBOARDING_DOWNLOAD") return;
            if (progressData.total !== 0) {
                this.percentage = Math.floor((progressData.downloaded / progressData.total)*100);
                this.download_speed = Math.floor((progressData.downloaded / (Date.now())*1000) / 100000);
            }
        },
        "download": function () {
            this.downloading = true;
            ddmm.onboarding.downloadGame();
        }
    },
    "mounted": function () {
        ddmm.on("download progress", this._progressCallback);
    },
    "destroyed": function () {
        ddmm.off("download progress", this._progressCallback);
    }
});