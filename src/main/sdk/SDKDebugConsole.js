"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
class SDKDebugConsole {
    /**
     * Initialises a console window for debugging the SDK
     * @param windowTitle The text to be appended to the window title
     */
    constructor(windowTitle) {
        this.window = new electron_1.BrowserWindow({
            width: 600,
            height: 400,
            minWidth: 400,
            minHeight: 200,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                preload: path_1.join(__dirname, "../../renderer/js-preload/sdk-preload.js") // contains all the IPC scripts
            }
        });
        this.window.setMenu(null);
        this.window.loadFile(path_1.join(__dirname, "../../renderer/html/sdk-debug.html"));
        this.window.setTitle("Debugging - " + windowTitle);
        this.window.on("ready-to-show", () => {
            this.window.show();
        });
        this.window.on("closed", () => {
            this.window = null;
        });
        this.window.webContents.openDevTools({
            mode: "undocked"
        });
    }
    /**
     * Logs text to the console
     * @param text The text to be logged
     * @param clazz The class to apply to the text (for warnings or errors)
     */
    log(text, clazz) {
        if (!this.window)
            return;
        if (this.window.isVisible()) {
            this.window.webContents.send("log", {
                text, clazz
            });
        }
        else {
            this.window.once("ready-to-show", () => {
                this.window.webContents.send("log", {
                    text, clazz
                });
            });
        }
    }
}
exports.default = SDKDebugConsole;
//# sourceMappingURL=SDKDebugConsole.js.map