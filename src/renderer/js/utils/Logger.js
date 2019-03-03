export default class Logger {
    static log(color, level, type, text) {
        console.log(`%c${level}%c${type}%c${text}`, `background-color: ${color}; color: #fff; padding: 0.25em 0.5em;`, "color: #fff; background-color: #2c3e50; padding: 0.25em 0.5em;", "padding-left: 1em;")
    }

    static info(type, text) {
        Logger.log("#2980b9", "Info", type, text);
    }

    static warn(type, text) {
        Logger.log("#d35400", "Warn", type, text);
    }

    static error(type, text) {
        Logger.log("#c0392b", "Error", type, text);
    }
}