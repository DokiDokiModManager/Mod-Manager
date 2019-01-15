import * as request from "request";

const DDLC_URL: string = "https://teamsalvato.itch.io/ddlc/file/";

const DOWNLOAD_CODE: string = "594897";

export default class DDLCDownloader {

    /**
     * Retrieves a direct download link for DDLC
     */
    public static getDownloadLink(): Promise<string> {
        return new Promise((ff, rj) => {

            // test case for poor connections
            // ff("http://ipv4.download.thinkbroadband.com/20MB.zip");
            // return;

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