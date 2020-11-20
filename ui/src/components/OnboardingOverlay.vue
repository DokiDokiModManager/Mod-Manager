<template>
    <div class="cover">
        <div class="onboarding-wizard">
            <div class="wizard-step" v-if="step === 1">
                <div class="wizard-step-content full-center">
                    <div>
                        <h1><strong>Doki Doki Mod Manager</strong> 4</h1>
                        <p>{{ _("renderer.onboarding_v4.text_welcome") }}</p>
                        <br>
                        <p>
                            <button class="primary" @click="getStarted" :disabled="game_selection.is_testing">
                                <i class="fas fa-arrow-right fa-fw"></i> {{ _("renderer.onboarding_v4.button_start") }}
                            </button>
                        </p>

                        <br>
                        <p v-if="game_selection.is_testing"><i class="fas fa-spinner fa-spin fa-fw"></i>
                            {{ _("renderer.onboarding_v4.text_scanning") }}</p>

                        <template v-if="developer && !developer_local_ui">
                            <br>
                            <p>
                                <a href="javascript:;" @click="developerLocalUI">Enable local UI for onboarding flow</a>
                            </p>
                        </template>
                    </div>
                </div>
            </div>

            <div class="wizard-step" v-else-if="step === 2">
                <div class="wizard-step-content">
                    <h1>{{ _("renderer.onboarding_v4.header_setup") }}</h1>
                    <p>{{ _("renderer.onboarding_v4.subtitle_careful") }}</p>

                    <br>

                    <div>
                        <div>
                            <h2>{{ _("renderer.onboarding_v4.header_download") }}</h2>
                            <p>{{ _("renderer.onboarding_v4.text_download", correct_version) }}</p>
                            <br>
                            <p>
                                <button class="success" @click="openURL('https://ddlc.moe')">
                                    <i class="fas fa-external-link-alt fa-fw"></i>
                                    {{ _("renderer.onboarding_v4.button_ddlc_website") }}
                                </button>
                            </p>
                            <br>
                            <p>{{ _("renderer.onboarding_v4.text_s2_next") }}</p>
                            <p><strong>{{ _("renderer.onboarding_v4.text_modification_warning") }}</strong></p>
                        </div>

                        <br>

                        <div v-if="warnings.mac_safari">
                            <h2>{{ _("renderer.onboarding_v4.header_safari_warning") }}</h2>

                            <p>
                                {{ _("renderer.onboarding_v4.text_safari_warning") }}
                                <Link to="https://help.doki.space/images/user_guide/macos_auto_extract.png">
                                    ({{ _("renderer.onboarding_v4.link_safari_warning") }})
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="wizard-step-controls">
                    <button class="secondary" @click="previous"><i class="fas fa-arrow-left fa-fw"></i>
                        {{ _("renderer.onboarding_v4.button_previous") }}
                    </button>
                    <button class="primary" @click="next"><i class="fas fa-arrow-right fa-fw"></i>
                        {{ _("renderer.onboarding_v4.button_next") }}
                    </button>
                </div>
            </div>

            <div class="wizard-step" v-else-if="step === 3">
                <div class="wizard-step-content">
                    <div>
                        <h1>{{ _("renderer.onboarding_v4.header_setup") }}</h1>
                        <p>{{ _("renderer.onboarding_v4.subtitle_careful") }}</p>
                    </div>

                    <br>

                    <p>{{ _("renderer.onboarding_v4.text_select") }}</p>

                    <br>

                    <DropZone :text="_('renderer.onboarding_v4.text_dropzone')"
                              @directory="folderCheck"
                              @file="fileCheck"
                              @click.native="browse"></DropZone>

                    <br>

                    <template v-if="game_selection.has_tried_once">
                        <template v-if="!game_selection.is_testing">
                            <h3>{{ game_selection.message.title }}</h3>
                            <p>{{ game_selection.message.text }}</p>
                        </template>
                        <template v-else>
                            <i class="fas fa-spinner fa-spin fa-fw"></i> {{
                                _("renderer.onboarding_v4.text_validating")
                            }}
                        </template>
                    </template>
                </div>
                <div class="wizard-step-controls">
                    <button class="secondary" @click="previous"><i class="fas fa-arrow-left fa-fw"></i>
                        {{ _("renderer.onboarding_v4.button_previous") }}
                    </button>
                    <button class="primary"
                            @click="next" :disabled="!game_selection.is_valid">
                        <i class="fas fa-arrow-right fa-fw"></i>
                        {{ _("renderer.onboarding_v4.button_next") }}
                    </button>
                </div>
            </div>

            <div class="wizard-step" v-else-if="step === 4">
                <div class="wizard-step-content">
                    <div>
                        <h1>{{ _("renderer.onboarding_v4.header_setup") }}</h1>
                        <p>{{ _("renderer.onboarding_v4.subtitle_last") }}</p>
                    </div>

                    <br>

                    <h2>{{ _("renderer.onboarding_v4.header_save_location") }}</h2>
                    <p>{{ _("renderer.onboarding_v4.text_save_location") }}</p>

                    <br>

                    <InstallFolderSelector @folder="selectInstallFolder"></InstallFolderSelector>

                    <br>

                    <h2>{{ _("renderer.onboarding_v4.header_waifu") }}</h2>
                    <p>{{ _("renderer.onboarding_v4.subtitle_waifu") }}</p>

                    <br>

                    <p><label for="ob_waifu">{{ _("renderer.onboarding_v4.label_waifu") }}</label></p>

                    <p>
                        <select v-model="background" id="ob_waifu">
                            <option value="default.png">{{ _("renderer.onboarding_v4.option_waifu_all") }}</option>
                            <option value="x-base-monika.png">{{ _("renderer.onboarding_v4.option_waifu_monika") }}
                            </option>
                            <option value="x-base-natsuki.png">{{ _("renderer.onboarding_v4.option_waifu_natsuki") }}
                            </option>
                            <option value="x-base-sayori.png">{{ _("renderer.onboarding_v4.option_waifu_sayori") }}
                            </option>
                            <option value="x-base-yuri.png">{{ _("renderer.onboarding_v4.option_waifu_yuri") }}</option>
                        </select>
                    </p>
                </div>
                <div class="wizard-step-controls">
                    <button class="secondary" @click="backFromLastStep"><i class="fas fa-arrow-left fa-fw"></i>
                        {{ _("renderer.onboarding_v4.button_previous") }}
                    </button>
                    <button class="primary" @click="finalise" :disabled="!save_directory"><i
                        class="fas fa-check fa-fw"></i>
                        {{ _("renderer.onboarding_v4.button_finish") }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import Link from "./elements/Link";
import DropZone from "./elements/DropZone";
import Logger from "../js/utils/Logger";
import InstallFolderSelector from "./elements/InstallFolderSelector";

export default {
    name: "OnboardingOverlay",
    components: {InstallFolderSelector, DropZone, Link},
    data() {
        return {
            developer: !!ddmm.env.DDMM_DEVELOPER,
            developer_local_ui: ddmm.config.readConfigValue("localUI"),
            save_directory: ddmm.config.readConfigValue("installFolder"),
            step: 1,
            skipped_selection: false,
            warnings: {
                // mac_safari: ddmm.platform === "darwin"
                mac_safari: true
            },
            correct_version: ddmm.platform === "darwin" ? "DDLC (Mac)" : "DDLC (Windows)",
            game_selection: {
                has_tried_once: false,
                is_testing: true,
                is_valid: false,
                path: "",
                message: {
                    title: "",
                    text: ""
                }
            },
            background: "default-bg.png"
        }
    },
    mounted() {
        // // ddmm.on("onboarding validated", this._validateCallback);
        // // ddmm.onboarding.scan();
        // setTimeout(() => {
        //     this.game_selection.is_testing = false;
        // }, 10000);
    },
    beforeDestroy() {
        ddmm.off("onboarding validated", this._validateCallback);
    },
    methods: {
        _: ddmm.translate,
        openURL: ddmm.shell.openURL,
        _validateCallback(result) {
            this.game_selection.is_testing = false;
            if (result.success && result.version_match) {
                this.game_selection.is_valid = true;
                this.game_selection.path = result.path;
                this.game_selection.message.title = ddmm.translate("renderer.onboarding_v4.header_success");
                this.game_selection.message.text = ddmm.translate("renderer.onboarding_v4.text_success");
            } else if (result.success) {
                this.game_selection.is_valid = false;
                this.game_selection.message.title = ddmm.translate("renderer.onboarding_v4.header_version_mismatch");
                this.game_selection.message.text = ddmm.translate("renderer.onboarding_v4.text_version_mismatch", this.correct_version);
            } else {
                this.game_selection.is_valid = false;
                this.game_selection.message.title = ddmm.translate("renderer.onboarding_v4.header_hash_mismatch");
                this.game_selection.message.text = ddmm.translate("renderer.onboarding_v4.text_hash_mismatch");
            }
        },
        getStarted() {
            if (this.game_selection.is_valid) {
                this.step = 4;
                this.skipped_selection = true;
            } else {
                this.step = 2;
            }
        },
        backFromLastStep() {
            if (this.skipped_selection) {
                this.step = 1;
            } else {
                this.step = 3;
            }
        },
        next() {
            this.step += 1;
        },
        previous() {
            this.step -= 1;
        },
        browse() {
            // const path = ddmm.onboarding.browse();
            // if (path) {
            //     this.validate(path);
            // }
        },
        folderCheck() {
            this.game_selection.has_tried_once = true;
            this.game_selection.is_valid = false;
            this.game_selection.message.title = ddmm.translate("renderer.onboarding_v4.header_directory_selected");
            this.game_selection.message.text = ddmm.translate("renderer.onboarding_v4.text_directory_selected");
        },
        fileCheck(item) {
            this.validate(item.path);
        },
        validate(path) {
            this.game_selection.is_testing = true;
            this.game_selection.is_valid = false;
            this.game_selection.has_tried_once = true;
            ddmm.onboarding.validateGame(path);
        },
        selectInstallFolder(folder) {
            this.save_directory = folder;
        },
        finalise() {
            Logger.info("Onboarding", "Finalising setup!");
            this.$store.commit("set_background", this.background);
            ddmm.config.saveConfigValue("installFolder", this.save_directory);
            this.$emit("close");
            ddmm.onboarding.finalise(this.game_selection.path);
        },
        developerLocalUI() {
            ddmm.config.saveConfigValue("localUI", "http://localhost:1234/");
            ddmm.app.restart();
        }
    }
}
</script>

<style scoped>

</style>
