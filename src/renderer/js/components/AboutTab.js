/*
    A component representing the about tab
 */
const AboutTab = Vue.component("ddmm-about-tab", {
    "template": `
<div>
    <img src="../images/ddmm.png" width="200" style="float: right">
    
    <h1>about</h1>
    <p>blah</p>
    
    <hr>
    
    <p>{{_("about.description")}}</p>
    
    <br>
    
    <h2>{{_("about.title_socials")}}</h2>
    
    <p><a href="javascript:;" @click="openURL('https://doki.space/discord')"><i class="fab fa-discord fa-fw"></i> {{_("about.social_discord")}}</a></p>
    <p><a href="javascript:;" @click="openURL('https://reddit.com/u/zuudo')"><i class="fab fa-reddit fa-fw"></i> {{_("about.social_reddit")}}</a></p>
    <p><a href="javascript:;" @click="openURL('mailto:zudo@doki.space')"><i class="fas fa-envelope fa-fw"></i> {{_("about.social_email")}}</a></p>
    
    <br>
    
    <h2>{{_("about.title_support")}}</h2>
    
    <p>{{_("about.description_support")}}</p>
    
    <p><a href="javascript:;" @click="openURL('https://streamlabs.com/zudo')"><i class="fas fa-heart fa-fw"></i> {{_("about.support_donate")}}</i></a></p>
    <p><a href="javascript:;" @click="openURL('http://i.refs.cc/KVKWf6h5?u=1542898035289')"><i class="fas fa-keyboard fa-fw"></i> {{_("about.support_steelseries")}}</a></p>
    <p><a href="javascript:;" @click="openURL('https://github.com/DokiDokiModManager/Mod-Manager')"><i class="fab fa-github fa-fw"></i> {{_("about.support_code")}}</a></p>
    
    <br>
    
    <h2>{{_("about.title_disclaimer")}}</h2>
    
    <p>{{_("about.disclaimer_1")}}</p>
    <p>{{_("about.disclaimer_2")}}</p>
</div>`,
    "props": ["ddmm_version"],
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        },
        "openURL": ddmm.openURL
    }
});