"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents the metadata of an installed mod.
 */
class Install {
    constructor(name, folderName, globalSave, screenshots, mod) {
        this.name = name;
        this.folderName = folderName;
        this.globalSave = globalSave;
        this.screenshots = screenshots;
        this.mod = mod;
    }
}
exports.default = Install;
class ModMetadata {
    constructor(name, description, author, uses_sdk, sayonika_id, discord, website) {
        this.name = name;
        this.description = description;
        this.author = author;
        this.uses_sdk = uses_sdk;
        this.sayonika_id = sayonika_id;
        this.discord = discord;
        this.website = website;
    }
}
//# sourceMappingURL=Install.js.map