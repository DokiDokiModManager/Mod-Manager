const fs = require("fs");
const assert = require("assert");

const validCodes = ["af", "am", "ar", "az", "be", "bg", "bh", "bn", "br", "bs", "ca", "co", "cs", "cy", "da", "de", "de-AT", "de-CH", "de-DE", "el", "en", "en-AU", "en-CA", "en-GB", "en-NZ", "en-US", "en-ZA", "eo", "es", "es-419", "et", "eu", "fa", "fi", "fil", "fo", "fr", "fr-CA", "fr-CH", "fr-FR", "fy", "ga", "gd", "gl", "gn", "gu", "ha", "haw", "he", "hi", "hr", "hu", "hy", "ia", "id", "is", "it", "it-CH", "it-IT", "ja", "jw", "ka", "kk", "km", "kn", "ko", "ku", "ky", "la", "ln", "lo", "lt", "lv", "mk", "ml", "mn", "mo", "mr", "ms", "mt", "nb", "ne", "nl", "nn", "no", "oc", "om", "or", "pa", "pl", "ps", "pt", "pt-BR", "pt-PT", "qu", "rm", "ro", "ru", "sd", "sh", "si", "sk", "sl", "sn", "so", "sq", "sr", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "to", "tr", "tt", "tw", "ug", "uk", "ur", "uz", "vi", "xh", "yi", "yo", "zh", "zh-CN", "zh-TW", "zu"];

describe('i18n functions', function () {
    it('should only find translation files with valid country codes', function () {
        fs.readdirSync("lang").forEach(fn => {
            if (fn.endsWith(".json")) {
                if (validCodes.indexOf(fn.split(".")[0]) === -1) {
                    throw new Error(fn + " does not match a valid country code - see https://electronjs.org/docs/api/locales");
                }
            }
        });
    });

    it('should parse each file without errors', function () {
        fs.readdirSync("lang").forEach(fn => {
            if (fn.endsWith(".json")) {
                const fileContents = fs.readFileSync("lang/" + fn, "utf8");
                JSON.parse(fileContents);
            }
        });
    });
});
