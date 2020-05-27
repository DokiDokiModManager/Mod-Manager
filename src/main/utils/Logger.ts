import * as chalk from "chalk";

export default class Logger {

    private static log(type: string, module: string, message: string, colour: any) {
        console.log(colour(`[${new Date().toLocaleTimeString()}] [${type}] [${module}] ${message}`));
    }

    static info(module: string, message: string) {
        Logger.log("Info", module, message, chalk.white);
    }

    static warn(module: string, message: string) {
        Logger.log("Warn", module, message, chalk.yellow);
    }

    static error(module: string, message: string) {
        Logger.log("Error", module, message, chalk.red);
    }
}
