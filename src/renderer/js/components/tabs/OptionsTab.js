const OptionsTab = Vue.component("ddmm-options-tab", {
    "template": `
<div class="page-content">
    <div class="mod-viewer-pane">
        <div class="mod-viewer-mod-list">
            <template v-for="section in menu">
                <div class="mod-view-mod-list-title">{{section.header}}</div>
                <div v-for="item in section.contents" :class="{'mod-view-mod-list-entry': true, 'active': selected_option === item.id, 'hide-appx': item.hideAppx}" @click="selectOption(item.id)">{{item.title}}</div>
                <br>
            </template>
        </div>
        <div class="mod-viewer-mod-display">
            <div v-if="selected_option === 'background'">
                <h1>{{_("renderer.tab_options.section_backgrounds.title")}}</h1>
                <p>{{_("renderer.tab_options.section_backgrounds.subtitle")}}</p>
                
                <br>
                
                <div class="screenshots">                       
                    <!--suppress RequiredAttributes, HtmlRequiredAltAttribute -->
                    <img v-for="img in backgrounds" :alt="img" :src="'../images/backgrounds/' + img" width="150" @click="setBackground(img)">
                </div>
                
                <br>
                
                <button class="danger" @click="setBackground('none')"><i class="fas fa-times fa-fw"></i> {{_("renderer.tab_options.section_backgrounds.button_none")}}</button>
                
                <br><br>
                
                <p>{{_("renderer.tab_options.section_backgrounds.description_credit")}}</p>
            </div>
            <div v-else-if="selected_option === 'advanced_appearance'">
                <h1>{{_("renderer.tab_options.section_advanced_appearance.title")}}</h1>
                <p>{{_("renderer.tab_options.section_advanced_appearance.subtitle")}}</p>
                <br>
                <button class="danger" v-if="systemBordersEnabled()" @click="setSystemBorders(false)"><i class="fas fa-times fa-fw"></i> {{_("renderer.tab_options.section_advanced_appearance.button_disable_sysborders")}}</button>
                <button class="success" v-else @click="setSystemBorders(true)"><i class="fas fa-check fa-fw"></i> {{_("renderer.tab_options.section_advanced_appearance.button_enable_sysborders")}}</button>
            </div>
            <div v-else-if="selected_option === 'cloudsaves'">
                <h1>{{_("renderer.tab_options.section_cloudsaves.title")}}</h1>
                <p>{{_("renderer.tab_options.section_cloudsaves.subtitle")}}</p>
                
                <br>
                
                <table v-if="getSaves()">
                    <thead>
                        <tr><th>{{_("renderer.tab_options.section_cloudsaves.table_header_name")}}</th><th>{{_("renderer.tab_options.section_cloudsaves.table_header_size")}}</th><th>{{_("renderer.tab_options.section_cloudsaves.table_header_options")}}</th></tr>   
                    </thead>
                    <tbody>
                        <tr v-for="(save, filename) in getSaves()">
                            <td>{{save.name}}</td>
                            <td>{{formatSize(save.size)}}</td>
                            <td><button class="success" @click="renameSave(filename, save.name)">{{_("renderer.tab_options.section_cloudsaves.button_rename")}}</button> <button class="danger" @click="deleteSave(filename, save.name)">{{_("renderer.tab_options.section_cloudsaves.button_delete")}}</button></td>
                        </tr>
                    </tbody>
                </table>
                
                <p v-else><strong>{{_("renderer.tab_options.section_cloudsaves.description_no_saves")}}</strong></p>
            </div>
            <div v-else-if="selected_option === 'updates'">
                <h1>{{_("renderer.tab_options.section_updates.title")}}</h1>
                <p>{{_("renderer.tab_options.section_updates.subtitle")}}</p>
                <br>
                <p><strong>{{_("renderer.tab_options.section_updates.description_current_version", version)}}</strong></p>
                <br>
                <p><button @click="checkUpdates" class="primary"><i class="fas fa-sync-alt fa-fw"></i> {{_("renderer.tab_options.section_updates.button_check")}}</button></p>
            </div>
            <div v-else-if="selected_option === 'storage'">
                <h1>{{_("renderer.tab_options.section_storage.title")}}</h1>
                <p>{{_("renderer.tab_options.section_storage.subtitle")}}</p>
                <br>
                <p><strong>{{_("renderer.tab_options.section_storage.description_moving")}}</strong></p>
                <br>
                <p>{{_("renderer.tab_options.section_storage.description_current", installFolder)}}</p>
                <br>
                <button class="primary" @click="moveInstall"><i class="fas fa-folder-open fa-fw"></i> {{_("renderer.tab_options.section_storage.button_change")}}</button>
            </div>
            <div v-else-if="selected_option === 'sdk'">
                <h1>{{_("renderer.tab_options.section_sdk.title")}}</h1>
                <p>{{_("renderer.tab_options.section_sdk.subtitle")}}</p>
                <br>
                <p><strong>{{_("renderer.tab_options.section_sdk.description_mode")}}</strong></p>
                <p><label><input type="radio" name="sdk_mode_checkbox" value="always" v-model="sdk_mode_interim" @change="updateSDKMode"> {{_("renderer.tab_options.section_sdk.checkbox_always")}}</label></p>
                <p><label><input type="radio" name="sdk_mode_checkbox" value="specified" v-model="sdk_mode_interim" @change="updateSDKMode"> {{_("renderer.tab_options.section_sdk.checkbox_specified")}}</label></p>
                <p><label><input type="radio" name="sdk_mode_checkbox" value="never" v-model="sdk_mode_interim" @change="updateSDKMode"> {{_("renderer.tab_options.section_sdk.checkbox_never")}}</label></p>                
            </div>
            <div v-else-if="selected_option === 'discord'">
                <h1>{{_("renderer.tab_options.section_discord.title")}}</h1>
                <p>{{_("renderer.tab_options.section_discord.subtitle")}}</p>
                <br>
                <p><strong>{{_("renderer.tab_options.section_discord.description")}}</strong></p>
                <br>
                <button class="danger" v-if="richPresenceEnabled()" @click="setRichPresence(false)"><i class="fas fa-times fa-fw"></i> {{_("renderer.tab_options.section_discord.button_disable")}}</button>
                <button class="success" v-else @click="setRichPresence(true)"><i class="fas fa-check fa-fw"></i> {{_("renderer.tab_options.section_discord.button_enable")}}</button>
            </div>
            <div v-else-if="selected_option === 'testing'">
                <h1>{{_("renderer.tab_options.section_testing.title")}}</h1>
                <p>{{_("renderer.tab_options.section_testing.subtitle")}}</p>
                <br>
                <button class="danger" v-if="sdkDebuggingEnabled()" @click="setSDKDebugging(false)"><i class="fas fa-times fa-fw"></i> {{_("renderer.tab_options.section_testing.button_disable")}}</button>
                <button class="success" v-else @click="setSDKDebugging(true)"><i class="fas fa-check fa-fw"></i> {{_("renderer.tab_options.section_testing.button_enable")}}</button>
            </div>
            <div v-else-if="selected_option === 'debug'">
                <h1>{{_("renderer.tab_options.section_debug.title")}}</h1>
                <p>{{_("renderer.tab_options.section_debug.subtitle")}}</p>
                <br>
                <p v-for="(v, k) in debug_info">
                    <strong>{{k}}:</strong> <span>{{v}}</span>
                </p>
            </div>
        </div>
    </div>
</div>
        `,
    "data": function () {
        return {
            "version": ddmm.version,
            "debug_info": ddmm.debug,
            "selected_option": sessionStorage.getItem("options_last_id"),
            "backgrounds": ddmm.app.getBackgrounds(),
            "sdk_mode_interim": ddmm.config.readConfigValue("sdkMode"),
            "release_channel_interim": ddmm.config.readConfigValue("updateChannel"),
            "cloudsaves": {},
            "menu": [
                {
                    "header": ddmm.translate("renderer.tab_options.list.header_appearance"),
                    "contents": [
                        {"title": ddmm.translate("renderer.tab_options.list.link_background"), "id": "background"},
                        {
                            "title": ddmm.translate("renderer.tab_options.list.link_advanced_appearance"),
                            "id": "advanced_appearance"
                        }
                    ]
                },
                {
                    "header": ddmm.translate("renderer.tab_options.list.header_account"),
                    "contents": [
                        {"title": ddmm.translate("renderer.tab_options.list.link_cloudsaves"), "id": "cloudsaves"},
                        {"title": ddmm.translate("renderer.tab_options.list.link_accmanagement"), "id": "accmanagement"}
                    ]
                },
                {
                    "header": ddmm.translate("renderer.tab_options.list.header_application"),
                    "contents": [
                        {
                            "title": ddmm.translate("renderer.tab_options.list.link_updates"),
                            "id": "updates",
                            "hideAppx": true
                        },
                        {"title": ddmm.translate("renderer.tab_options.list.link_storage"), "id": "storage"}
                    ]
                },
                {
                    "header": ddmm.translate("renderer.tab_options.list.header_enhancements"),
                    "contents": [
                        {"title": ddmm.translate("renderer.tab_options.list.link_sdk"), "id": "sdk"},
                        {"title": ddmm.translate("renderer.tab_options.list.link_discord"), "id": "discord"}
                    ]
                },
                {
                    "header": ddmm.translate("renderer.tab_options.list.header_developers"),
                    "contents": [
                        {"title": ddmm.translate("renderer.tab_options.list.link_testing"), "id": "testing"},
                        {"title": ddmm.translate("renderer.tab_options.list.link_debug"), "id": "debug"}
                    ]
                }
            ]
        }
    },
    "computed": {
        "installFolder": function () {
            return ddmm.config.readConfigValue("installFolder");
        },
        "isLoggedIn": function () {
            return !!firebase.auth().currentUser;
        }
    },
    "methods": {
        "_": ddmm.translate,
        "moveInstall": ddmm.app.beginMoveInstall,
        "selectOption": function (option) {
            this.selected_option = option;
            sessionStorage.setItem("options_last_id", option);
        },
        "setBackground": function (background) {
            ddmm.config.saveConfigValue("background", background);
            setCloudPreference("background", background);
            this.$emit("set_background", background);
        },
        "richPresenceEnabled": function () {
            return ddmm.config.readConfigValue("discordEnabled");
        },
        "sdkDebuggingEnabled": function () {
            return ddmm.config.readConfigValue("sdkDebuggingEnabled");
        },
        "setRichPresence": function (enabled) {
            ddmm.config.saveConfigValue("discordEnabled", !!enabled);
            this.$forceUpdate();
        },
        "setSDKDebugging": function (enabled) {
            ddmm.config.saveConfigValue("sdkDebuggingEnabled", !!enabled);
            this.$forceUpdate();
        },
        "updateSDKMode": function () {
            ddmm.config.saveConfigValue("sdkMode", this.sdk_mode_interim);
        },
        "updateReleaseChannel": function () {
            ddmm.config.saveConfigValue("updateChannel", this.release_channel_interim);
        },
        "checkUpdates": function () {
            ddmm.app.update();
        },
        "setSystemBorders": function (enabled) {
            ddmm.config.saveConfigValue("systemBorders", enabled);
            this.$forceUpdate();
        },
        "systemBordersEnabled": function () {
            return ddmm.config.readConfigValue("systemBorders");
        },
        "refreshSaves": function () {
            this.cloudsaves = getSaves();
        },
        "formatSize": function (size) {
            if (!size) return "0 bytes";
            return Math.floor(size / 1024) + " KiB";
        },
        "getSaves": function () {
            return getSaves();
        },
        "renameSave": function (filename, oldName) {
            ddmm.window.input({
                title: ddmm.translate("renderer.tab_options.cloudsave_rename_input.message"),
                description: ddmm.translate("renderer.tab_options.cloudsave_rename_input.details", oldName),
                button_affirmative: ddmm.translate("renderer.tab_options.cloudsave_rename_input.button_affirmative"),
                button_negative: ddmm.translate("renderer.tab_options.cloudsave_rename_input.button_negative"),
                callback: (newName) => {
                    if (newName) {
                        firebase.database().ref("/saves/" + firebase.auth().currentUser.uid + "/" + filename + "/name").set(newName);
                    }
                }
            });
        },
        "deleteSave": function (filename, oldName) {
            ddmm.window.prompt({
                title: ddmm.translate("renderer.tab_options.cloudsave_delete_prompt.message"),
                description: ddmm.translate("renderer.tab_options.cloudsave_delete_prompt.details", oldName),
                button_affirmative: ddmm.translate("renderer.tab_options.cloudsave_delete_prompt.button_affirmative"),
                button_negative: ddmm.translate("renderer.tab_options.cloudsave_delete_prompt.button_negative"),
                callback: (confirm) => {
                    if (confirm) {
                        firebase.database().ref("/saves/" + firebase.auth().currentUser.uid + "/" + filename).remove();
                        firebase.storage().ref("/userdata/" + firebase.auth().currentUser.uid + "/" + filename).delete();
                    }
                }
            });
        }
    },
    "mounted": function() {
        if (!this.selected_option) {
            this.selected_option = "background";
        }
    }
});