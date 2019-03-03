import Logger from "./Logger";

export default class Launcher {

    static launch(install) {
        Logger.info("Game Launch", "Preparing to launch install " + install);
        ddmm.mods.launchInstall(install);
        Logger.info("Game Launch", "Launched " + install);
    }
}