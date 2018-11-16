/*
    A component representing the about tab
 */
const AboutTab = Vue.component("ddmm-about-tab", {
    "template": `
<div>
    AYAYA
</div>`,
    "props": ["ddmm_version"],
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        }
    }
});