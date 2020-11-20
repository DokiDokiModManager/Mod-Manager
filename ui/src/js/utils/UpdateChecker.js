import * as semver from "semver";

export default class UpdateChecker {

    static getLatest(store) {
        return new Promise((ff, rj) => {
            if (!ddmm.system.getFeatureFlag("autoUpdate")) {
                store.commit("set_update_status", "none");
                ff(ddmm.version);
            }
            if (ddmm.env.DDMM_FAKE_UPDATE) {
                store.commit("set_update_status", "available");
                ff(ddmm.env.DDMM_FAKE_UPDATE);
            } else {
                fetch("https://api.github.com/repos/DokiDokiModManager/Mod-Manager/releases/latest").then(res => res.json()).then(release => {
                    if (semver.gt(release.name, ddmm.version)) {
                        store.commit("set_update_status", "available");
                    } else {
                        store.commit("set_update_status", "none");
                    }
                    ff(release.name);
                }).catch(err => {
                    rj(err);
                });
            }
        });
    }
}
