import * as request from "request";

const DDLC_URL = "https://teamsalvato.itch.io/ddlc/file/";

const DOWNLOAD_CODE = process.platform === "darwin" ? "594901" : "594897";

export default class DDLCDownloader {

    /**
     * Retrieves a direct download link for DDLC
     */
    public static getDownloadLink(): Promise<string> {
        return new Promise((ff, rj) => {
            // make a post request to the URL
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
                        ff(data.url); // return the URL to the caller
                    } else {
                        rj();
                    }
                } catch (e) {
                    rj(e);
                }
            });
        });
    }
}