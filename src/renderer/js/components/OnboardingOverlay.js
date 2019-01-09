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
        <div>{{_("renderer.onboarding.status_downloading", formattedPercentage, eta, speed)}}</div>
    </div>
</div>
    `,
    "data": function () {
        return {
            "downloading": false,
            "percentage": 0,
            "eta": 0,
            "speed": 0
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
                this.percentage = Math.floor((progressData.downloaded / progressData.total) * 100);

                const elapsedTime = Date.now() / 1000 - progressData.startTime;

                const etaSeconds = (elapsedTime * (progressData.total / progressData.downloaded)) - elapsedTime;

                const speed = (progressData.downloaded / 1000000) / elapsedTime;

                this.speed = Math.floor(speed * 100) / 100;

                this.eta = (etaSeconds <= 60 ? "about a minute" : Math.floor(etaSeconds / 60) + 1 + " minutes");
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