import {BrowserWindow} from "electron";

export default class AccountUpgradeUI {

    private static upgradeUI: BrowserWindow;

    public static show(token: string): void {
        this.upgradeUI = new BrowserWindow({
            webPreferences: {
                nodeIntegration: false
            },
            width: 1000,
            height: 600
        });

        this.upgradeUI.setMenu(null);
        this.upgradeUI.setMenuBarVisibility(false);

        this.upgradeUI.loadURL("https://app.doki.space/upgrade?token=" + encodeURIComponent(token));
    }
}