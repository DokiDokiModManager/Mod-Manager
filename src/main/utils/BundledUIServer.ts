import * as express from "express";
import {join as joinPath} from "path";
import Logger from "./Logger";

export default class BundledUIServer {

    static start(): Promise<number> {
        return new Promise(((resolve, reject) => {
            const app = express();
            app.use(express.static(joinPath(process.resourcesPath, "../ui/")));
            const server = app.listen(0, () => {
                const port: number = server.address().port;
                Logger.info("Bundled UI Server", "Listening on port " + port);
                resolve(port);
            })
        }));
    }
}
