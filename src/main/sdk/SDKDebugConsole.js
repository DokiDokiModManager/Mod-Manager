"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
class SDKDebugConsole {
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
        this.window.webContents.openDevTools();
    }
    log(text, clazz) {
        this.window.webContents.send("log", {
            text, clazz
        });
    }
}
exports.default = SDKDebugConsole;
//# sourceMappingURL=SDKDebugConsole.js.map