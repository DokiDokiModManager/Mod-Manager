import * as request from "request";

const DDLC_URL = "https://teamsalvato.itch.io/ddlc/file/";

const DOWNLOAD_CODE = process.platform === "darwin" ? "594901" : "594897";

export default class DownloadLinkRetriever {

    public static getDownloadLink() {
        return new Promise((ff, rj) => {
            request({
                method: "POST",
                url: DDLC_URL + DOWNLOAD_CODE,
            }, (e, r, b) => {
                if (e) {
                    rj(e);
                }

                try {
                    const data = JSON.parse(b);
                    if (data.url) {
                        ff(data.url);
                    }
                } catch (e) {
                    rj(e);
                }
            });
        });
    }
}
