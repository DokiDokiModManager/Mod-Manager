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
    </div>
</div>
        `,
    "data": function () {
        return {
            "selected_option": sessionStorage.getItem("options_last_id"),
            "menu": [
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
                },
                {
                    "header": ddmm.translate("renderer.tab_options.list.header_application"),
                    "contents": [
                        {"title": ddmm.translate("renderer.tab_options.list.link_storage"), "id": "storage"}
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
        }
    },
    "mounted": function () {
        if (!this.selected_option) {
            this.selected_option = this.menu[0].contents[0].id;
        }
    }
});