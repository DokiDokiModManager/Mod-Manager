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
        
        <br>
        
        <h2>{{_("renderer.tab_about.title_socials")}}</h2>
        <p><a href="javascript:;" @click="openURL('https://doki.space/discord')"><i class="fab fa-discord fa-fw"></i> {{_("renderer.tab_about.social_discord")}}</a></p>
        <p><a href="javascript:;" @click="openURL('https://twitter.com/DokiMod')"><i class="fab fa-twitter fa-fw"></i> {{_("renderer.tab_about.social_twitter")}}</a></p>
        <p><a href="javascript:;" @click="openURL('https://www.reddit.com/message/compose?to=zuudo')"><i class="fab fa-reddit fa-fw"></i> {{_("renderer.tab_about.social_reddit")}}</a></p>
        <p><a href="javascript:;" @click="openURL('mailto:zudo@doki.space')"><i class="fas fa-envelope fa-fw"></i> {{_("renderer.tab_about.social_email")}}</a></p>
    </div>
</div>
        `,
    "methods": {
        "_": ddmm.translate,
        "openURL": ddmm.app.openURL
    }
});