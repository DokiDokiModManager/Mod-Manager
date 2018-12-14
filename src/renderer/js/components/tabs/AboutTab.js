const AboutTab = Vue.component("ddmm-about-tab", {
    "template": `
<div class="page-content">
    <div class="text-container">
        <img src="../images/ddmm.png" width="200" style="float: right; padding: 1em;">
        
        <h1>{{_("renderer.tab_about.title")}}</h1>
        <p>{{_("renderer.tab_about.description")}}</p>
        
        <br>
        
        <h2>{{_("renderer.tab_about.title_disclaimer")}}</h2>
        <p>{{_("renderer.tab_about.disclaimer_1")}}</p>
        <br>
        <p>{{_("renderer.tab_about.disclaimer_2")}}</p>
    </div>
</div>
        `,
    "methods": {
        "_": ddmm.translate,
    }
});