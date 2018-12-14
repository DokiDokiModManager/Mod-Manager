const OptionsTab = Vue.component("ddmm-options-tab", {
    "template": `
<div class="page-content">
    <div class="mod-viewer-pane">
        <div class="mod-viewer-mod-list">
            <template v-for="section in menu">
                <div class="mod-view-mod-list-title">{{section.header}}</div>
                <div v-for="item in section.contents" :class="{'mod-view-mod-list-entry': true, 'active': selected_option === item.id}" @click="selectOption(item.id)">{{item.title}}</div>
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
                
                <button class="danger" @click="setBackground('none')">{{_("renderer.tab_options.section_backgrounds.button_none")}}</button>
            </div>
        </div>
    </div>
</div>
        `,
    "data": function () {
        return {
            "selected_option": sessionStorage.getItem("options_last_id"),
            "backgrounds": ddmm.app.getBackgrounds(),
            "menu": [
                {
                    "header": ddmm.translate("renderer.tab_options.list.header_application"),
                    "contents": [
                        {"title": ddmm.translate("renderer.tab_options.list.link_storage"), "id": "storage"}
                    ]
                },
                {
                    "header": ddmm.translate("renderer.tab_options.list.header_appearance"),
                    "contents": [
                        {"title": ddmm.translate("renderer.tab_options.list.link_background"), "id": "background"}
                    ]
                },
                {
                    "header": ddmm.translate("renderer.tab_options.list.header_enhancements"),
                    "contents": [
                        {"title": ddmm.translate("renderer.tab_options.list.link_sdk"), "id": "sdk"},
                        {"title": ddmm.translate("renderer.tab_options.list.link_discord"), "id": "discord"}
                    ]
                }
            ]
        }
    },
    "methods": {
        "_": ddmm.translate,
        "selectOption": function (option) {
            this.selected_option = option;
            sessionStorage.setItem("options_last_id", option);
        },
        "setBackground": function (background) {
            ddmm.config.saveConfigValue("background", background);
            this.$emit("set_background", background);
        }
    },
    "mounted": function () {
        if (!this.selected_option) {
            this.selected_option = this.menu[0].contents[0].id;
        }
    }
});