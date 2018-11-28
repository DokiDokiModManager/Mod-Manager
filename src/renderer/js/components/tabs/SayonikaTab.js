/*
    A component representing the Sayonika tab
 */
// noinspection HtmlUnknownTarget
const SayonikaTab = Vue.component("ddmm-sayonika-tab", {
    "template": `
        <div>
            <img src="../images/sayonika-logo.svg" height="65" alt="Sayonika Logo">
            
            <ul class="tabs">
                <li v-for="t in tabs" :class="{'active': t.id === tab}" @click="tab = t.id"><a href="javascript:;">{{t.name}}</a></li>
            </ul>
            
            <div v-if="tab === 'home'">
            
             </div>
        </div>
    `,
    "data": function () {
        return {
            "tab": "home",
            "tabs": [
                {"name": "Home", "id": "home"},
                {"name": "Popular", "id": "popular"},
                {"name": "Recent", "id": "recent"},
                {"name": "Search", "id": "search"}
            ]
        }
    },
    "methods": {
        "_": function () {
            return ddmm.translate.apply(null, arguments);
        }
    }
});

const SAYONIKA_BASE_URL = "https://sayonika.moe.invalid/api/v1/";

function callSayonikaAPI(endpoint, method, body) {
    return new Promise((ff, rj) => {
        fetch(SAYONIKA_BASE_URL + endpoint, {
            "method": (method ? method : "GET"),
            "body": (body ? JSON.stringify(body) : undefined),
            "headers": {
                "Content-Type": "application/json"
            }
        }).then(r => r.json()).then(r => {
            ff(r);
        }).catch(e => {
            rj(e);
        });
    });
}