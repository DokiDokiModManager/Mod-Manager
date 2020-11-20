import Logger from "./Logger";

export default class Launcher {

    static launch(install, store) {
        Logger.info("Game Launch", "Preparing to launch install " + install);
        if (!install.archived) {
            ddmm.mods.launchInstall(install.folderName);
            Logger.info("Game Launch", "Launched " + install);
        } else {
            store.commit("select_install", {install});
            store.commit("show_modal", {modal: "install_unarchive"});
        }
    }
}
