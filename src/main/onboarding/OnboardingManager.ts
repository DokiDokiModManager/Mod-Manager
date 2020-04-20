import {existsSync} from "fs";
import {join as joinPath} from "path";
import Config from "../utils/Config";
import IntegrityCheck from "./IntegrityCheck";

export default class OnboardingManager {

    /**
     * Returns true if the user needs to download a copy of DDLC, false otherwise.
     */
    public static requiresOnboarding(): Promise<null> {
        return new Promise((ff, rj) => {
            const path: string = joinPath(Config.readConfigValue("installFolder"), "ddlc.zip");
            if (existsSync(path)) {
                IntegrityCheck.checkGameIntegrity(path).then(() => {
                    ff();
                }).catch(e => {
                    rj(e);
                });
            } else {
                rj("Game does not exist");
            }
        });
    }
}
