/*
    A component representing the Sayonika tab
 */
const SayonikaTab = Vue.component("ddmm-sayonika-tab", {
    "template": `
        <div>
            <img src="../images/sayonika_full_body_maintenance.png" width="400" style="float: right;">
           
            <h1>{{_("sayonika.tab_title")}}</h1>
            <p>{{_("sayonika.tab_subtitle")}}</p>
           
            <br>
           
            <p><strong>{{_("sayonika.nyi_description")}}</strong></p>
            
        </div>
    `,
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        }
    }
});