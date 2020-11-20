import {BrowserWindow} from "electron";
import {join as joinPath} from "path";
import {LogClass} from "./LogClass";

export default class SDKDebugConsole {

    private window: BrowserWindow;

    /**
     * Initialises a console window for debugging the SDK
     * @param windowTitle The text to be appended to the window title
     */
    constructor(windowTitle: string) {
        this.window = new BrowserWindow({
            width: 800,
            height: 400,
            minWidth: 400,
            minHeight: 200,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                preload: joinPath(__dirname, "../../../src/renderer/js-preload/sdk-preload.js") // contains all the IPC scripts
            }
        });

        this.window.setMenu(null);

        this.window.loadFile(joinPath(__dirname, "../../../src/renderer/html/sdk-debug.html"));

        this.window.setTitle("Debugging - " + windowTitle);

        this.window.on("ready-to-show", () => {
            this.window.show();
        });

        this.window.on("closed", () => {
            this.window = null;
        });
    }

    /**
     * Logs text to the console
     * @param text The text to be logged
     * @param clazz The class to apply to the text (for warnings or errors)
     */
    log(text: string, clazz?: LogClass) {
        if (!this.window) return;
        if (this.window.isVisible()) {
            this.window.webContents.send("log", {
                text, clazz
            });
        } else {
            this.window.once("ready-to-show", () => {
                this.window.webContents.send("log", {
                    text, clazz
                });
            });
        }
    }

    /**
     * Closes the debugging console
     */
    shutdown() {
        if (!this.window) return;
        this.window.close();
    }
}