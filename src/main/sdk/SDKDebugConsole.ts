import {BrowserWindow} from "electron";
import {join as joinPath} from "path";

export default class SDKDebugConsole {

    private window: BrowserWindow;

    constructor(windowTitle: string) {
        this.window = new BrowserWindow({
            width: 600,
            height: 400,
            minWidth: 400,
            minHeight: 200,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                preload: joinPath(__dirname, "../../renderer/js-preload/sdk-preload.js") // contains all the IPC scripts
            }
        });

        this.window.setMenu(null);

        this.window.loadFile(joinPath(__dirname, "../../renderer/html/sdk-debug.html"));

        this.window.setTitle("Debugging - " + windowTitle);

        this.window.on("ready-to-show", () => {
            this.window.show();
        });

        this.window.webContents.openDevTools();
    }

    log(text: string, clazz?: ["warning", "error"]) {
        this.window.webContents.send("log", {
            text, clazz
        });
    }
}