/*
    A component representing the Sayonika tab
 */
const SayonikaTab = Vue.component("ddmm-sayonika-tab", {
    "template": `
        <div>
            <img src="../images/sayonika-logo.svg" height="65">   
        </div>
    `,
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