"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
class Logger {
    static debug(msg) {
        Logger.log(msg, chalk_1.default.white, "Debug");
    }
    static info(msg) {
        Logger.log(msg, chalk_1.default.blue, "Info");
    }
    static warn(msg) {
        Logger.log(msg, chalk_1.default.yellow, "Warning");
    }
    static error(msg) {
        Logger.log(msg, chalk_1.default.red, "Error");
    }
    static log(msg, colour, type) {
        console.log(colour("[" + type + "] " + msg));
    }
}
exports.default = Logger;
//# sourceMappingURL=Logger.js.map