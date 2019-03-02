<template>
    <div :class="['app', 'os-'+system_platform, appx ? 'is-appx': 'is-standard']"
         :style="{'background-image': backgroundImageStyle}">
        <ddmm-onboarding v-if="onboarding" :style="{'background-image': backgroundImageStyle}"
                         @close="onboarding = false"></ddmm-onboarding>
        <ddmm-drop-overlay v-if="dropping_mod" @end="dropping_mod = false" @file="showInstallMod"></ddmm-drop-overlay>
        <div class="cover" v-if="running_cover.display" :style="{'background-image': backgroundImageStyle}">
            <h1>{{running_cover.title}}</h1>
            <p>{{running_cover.description}}</p>
            <template v-if="!running_cover.dismissable">
                <br>
                <p>
                    <button class="primary" @click="showFile(running_cover.folder_path)"><i
                            class="fas fa-folder fa-fw"></i>
                        {{_("main.running_cover.button_browse")}}
                    </button>
                </p>
            </template>
            <br>
            <p>
                <button v-if="running_cover.dismissable" @click="running_cover.display = false" class="primary"><i
                        class="fas fa-times fa-fw"></i> {{_("main.running_cover.button_close")}}
                </button>
            </p>
        </div>

        <div class="cover" v-if="syncing_save" :style="{'background-image': backgroundImageStyle}">
            <h1>{{_("renderer.sync_overlay.title")}}</h1>
            <p>{{_("renderer.sync_overlay.description")}}</p>
        </div>

        <div class="cover crash" v-if="crash_cover.display"
             :style="{'background-image': (crash_cover.fatal ? backgroundImageCrashStyle : backgroundImageStyle)}">
            <h1>{{crash_cover.title}}</h1>
            <p>{{crash_cover.description}}</p>
            <br>
            <p v-if="crash_cover.fatal">
                <button class="danger" @click="windowClose"><i class="fas fa-times fa-fw"></i>
                    {{_("renderer.crash_cover.button_close")}}
                </button>
            </p>
            <p v-else>
                <button class="danger" @click="crash_cover.display = false"><i class="fas fa-arrow-right fa-fw"></i>
                    {{_("renderer.crash_cover.button_continue")}}
                </button>
            </p>
            <br>
            <span>{{crash_cover.stacktrace}}</span>
        </div>

        <div class="cover" v-if="prompt_cover.display" :style="{'background-image': backgroundImageStyle}">
            <h1>{{prompt_cover.title}}</h1>
            <p>{{prompt_cover.description}}</p>
            <br>
            <p>
                <button :class="[prompt_cover.affirmative_style]" @click="closePrompt(true)"><i
                        class="fas fa-check fa-fw"></i> {{prompt_cover.button_affirmative}}
                </button>
                <button class="secondary" @click="closePrompt(false)"><i class="fas fa-times fa-fw"></i>
                    {{prompt_cover.button_negative}}
                </button>
            </p>
        </div>

        <div class="cover" v-if="input_cover.display" :style="{'background-image': backgroundImageStyle}">
            <h1>{{input_cover.title}}</h1>
            <p>{{input_cover.description}}</p>
            <br>
            <div><input type="text" v-model="input_cover.input" autofocus ref="input_cover_field"></div>
            <br>
            <p>
                <button class="primary" @click="closeInput(input_cover.input)"><i class="fas fa-check fa-fw"></i>
                    {{input_cover.button_affirmative}}
                </button>
                <button class="secondary" @click="closeInput(null)"><i class="fas fa-times fa-fw"></i>
                    {{input_cover.button_negative}}
                </button>
            </p>
        </div>

        <div class="titlebar">
            <div class="app-title">
                <span>{{app_name}}</span>
                <small>v{{app_version}} (<a href="javascript:;"
                                            @click="openURL('https://help.doki.space/changelog/v' + app_version.replace(/\./g, '_'))">{{_("renderer.version.link_changelog")}}</a>)
                </small>
            </div>
            <div class="window-buttons">
                <div v-if="app_updating === 'checking'" :title="_('renderer.window_controls.update.checking')">
                    <i class="fas fa-sync-alt fa-spin"></i>
                </div>
                <div v-else-if="app_updating === 'available'" :title="_('renderer.window_controls.update.available')"
                     @click="downloadUpdate">
                    <i class="fas fa-download window-button-draw-attention"></i>
                </div>
                <div v-else-if="app_updating === 'downloading'"
                     :title="_('renderer.window_controls.update.downloading')">
                    <i class="fas fa-sync-alt fa-spin"></i>
                </div>
                <div v-else-if="app_updating === 'downloaded'" :title="_('renderer.window_controls.update.downloaded')"
                     @click="restart">
                    <i class="fas fa-download"></i>
                </div>

                <div @click="viewAnnouncement" :title="_('renderer.window_controls.announcement')"
                     v-if="announcement.active"><i
                        :class="{'fas': true, 'fa-bell': true, 'window-button-draw-attention': flashAnnouncement}"></i>
                </div>

                <div @click="showHelpMenu" :title="_('renderer.window_controls.help')"><i class="fas fa-question"></i>
                </div>

                <div @click="login" v-if="!getLoggedInUsername()">{{_('renderer.window_controls.login')}}</div>
                <div @click="showUserMenu" v-else
                     style="max-width: 200px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                    {{getLoggedInUsername()}}
                </div>

                <template v-if="!system_borders">
                    <div @click="windowMinimise" :title="_('renderer.window_controls.minimise')"><i
                            class="far fa-window-minimize fa-fw"></i></div>
                    <div @click="windowMaximise" :title="_('renderer.window_controls.maximise')"><i
                            class="far fa-window-maximize fa-fw"></i></div>
                    <div @click="windowClose" :title="_('renderer.window_controls.close')"><i
                            class="fas fa-times fa-fw"></i></div>
                </template>
            </div>
        </div>
        <component
                :is="currentTabComponent"
                @set_background="setBackground"
        ></component>
        <div class="navbar">
            <div class="nav-links">
                <div v-for="t in tabs" :class="{'active': t.id === tab}" @click="tab = t.id">{{t.name}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ddmm-app",
        data: () => {
            return {
                "appx": false,
                "onboarding": false,
                "background_image": ddmm.config.readConfigValue("background"),
                "app_name": "Doki Doki Mod Manager",
                "app_version": ddmm.version,
                "system_platform": ddmm.platform,
                "app_updating": "none",
                "tab": "mods",
                "system_borders": ddmm.config.readConfigValue("systemBorders"),
                "dropping_mod": false,
                "syncing_save": false,
                "announcement": {
                    "active": false,
                    "title": "",
                    "description": "",
                    "url": ""
                },
                "tabs": [
                    {"id": "mods", "name": ddmm.translate("renderer.tabs.tab_mods"), "component": "ddmm-mods-tab"},
                    {
                        "id": "sayonika",
                        "name": ddmm.translate("renderer.tabs.tab_sayonika"),
                        "component": "ddmm-sayonika-tab"
                    },
                    {
                        "id": "options",
                        "name": ddmm.translate("renderer.tabs.tab_options"),
                        "component": "ddmm-options-tab"
                    },
                    {"id": "about", "name": ddmm.translate("renderer.tabs.tab_about"), "component": "ddmm-about-tab"}
                ],
                "running_cover": {
                    "display": false,
                    "title": "",
                    "description": "",
                    "dismissable": false
                },
                "crash_cover": {
                    "display": false,
                    "title": "",
                    "description": "",
                    "fatal": false,
                    "stacktrace": ""
                },
                "prompt_cover": {
                    "display": false,
                    "title": "",
                    "description": "",
                    "affirmative_style": "primary",
                    "button_affirmative": "",
                    "button_negative": "",
                    "callback": null
                },
                "input_cover": {
                    "display": false,
                    "title": "",
                    "description": "",
                    "button_affirmative": "",
                    "button_negative": "",
                    "input": "",
                    "callback": null
                }
            };
        },
        "computed": {
            "currentTabComponent": function () {
                return this.tabs.find(t => t.id === this.tab).component;
            },
            "backgroundImageStyle": function () {
                if (this.background_image && this.background_image !== "none") {
                    return "radial-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.99) 90%), url(../images/backgrounds/" + this.background_image + ")";
                } else {
                    return "linear-gradient(#111, #111)";
                }
            },
            "backgroundImageCrashStyle": function () {
                if (this.background_image && this.background_image !== "none") {
                    return "radial-gradient(rgba(64, 0, 0, 0.5), rgba(64, 0, 0, 0.99) 90%), url(../images/backgrounds/" + this.background_image + ")";
                } else {
                    return "linear-gradient(rgb(64, 0, 0), rgb(64, 0, 0))";
                }
            },
            "flashAnnouncement": function () {
                return localStorage.getItem("last_announcement") !== this.announcement.title;
            }
        },
        "methods": {
            "_": ddmm.translate,
            "windowMaximise": ddmm.window.maximise,
            "windowClose": ddmm.window.close,
            "windowMinimise": ddmm.window.minimise,
            "openURL": ddmm.app.openURL,
            "downloadUpdate": ddmm.app.downloadUpdate,
            "showFile": ddmm.app.showFile,
            "setBackground": function (image) {
                this.background_image = image;
            },
            "closePrompt": function (yes) {
                this.prompt_cover.callback(!!yes);
                this.prompt_cover.display = false;
            },
            "closeInput": function (input) {
                this.input_cover.callback(input);
                this.input_cover.display = false;
            },
            "showInstallMod": function (mod) {
                this.tab = "mods";
                this.$nextTick(() => {
                    ddmm.emit("create install", mod);
                });
            },
            "showHelpMenu": function (ev) {
                ddmm.app.showHelpMenu(ev.clientX, ev.clientY);
            },
            "showUserMenu": function (ev) {
                ddmm.app.showUserMenu(ev.clientX, ev.clientY);
            },
            "viewAnnouncement": function () {
                localStorage.setItem("last_announcement", this.announcement.title);
                ddmm.window.prompt({
                    title: this.announcement.title,
                    description: this.announcement.description,
                    affirmative_style: "primary",
                    button_affirmative: ddmm.translate("renderer.announcement.button_open"),
                    button_negative: ddmm.translate("renderer.announcement.button_close"),
                    callback: (open) => {
                        if (open) {
                            ddmm.app.openURL(this.announcement.url);
                        }
                    }
                });
            },
            "login": function () {
                ddmm.window.input({
                    title: ddmm.translate("renderer.login_input.message"),
                    description: ddmm.translate("renderer.login_input.details"),
                    affirmative_style: "primary",
                    button_affirmative: ddmm.translate("renderer.login_input.button_affirmative"),
                    button_negative: ddmm.translate("renderer.login_input.button_negative"),
                    callback: (email) => {
                        if (email) {
                            loginToApp(email);
                        }
                    }
                });
            },
            "getLoggedInUsername": function () {
                return getLoggedInUsername();
            }
        }
    }
</script>

<style scoped>

</style>