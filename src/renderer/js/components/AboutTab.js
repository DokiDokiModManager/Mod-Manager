/*
    A component representing the about tab
 */
const AboutTab = Vue.component("ddmm-about-tab", {
    "template": `
<div>
    <div style="text-align: center;">
        <img src="../images/ddmm.png" width="300">
    </div>
    
    <br>
    
    <p>{{_("about.description")}}</p>
    
    <br>
    
    <h2>{{_("about.title_disclaimer")}}</h2>
    
    <p>{{_("about.disclaimer_1")}}</p>
    <p>{{_("about.disclaimer_2")}}</p>
    
    <br>
    
    <h2>{{_("about.title_socials")}}</h2>
    
    <p><a href="javascript:;" @click="openURL('https://doki.space/discord')"><i class="fab fa-discord fa-fw"></i> {{_("about.social_discord")}}</a></p>
    <p><a href="javascript:;" @click="openURL('https://reddit.com/u/zuudo')"><i class="fab fa-reddit fa-fw"></i> {{_("about.social_reddit")}}</a></p>
    <p><a href="javascript:;" @click="openURL('mailto:zudo@doki.space')"><i class="fas fa-envelope fa-fw"></i> {{_("about.social_email")}}</a></p>
</div>`,
    "props": ["ddmm_version"],
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        },
        "openURL": ddmm.openURL
    }
});