/**
 * Represents the metadata of an installed mod.
 */
export default class Install {
    public readonly name: string;
    public readonly folderName: string;
    public readonly globalSave: boolean;
    public readonly screenshots: string[];
    public readonly mod: ModMetadata;
    public readonly achievements: any[]; // TODO: set up type defs

    constructor(name: string, folderName: string, globalSave: boolean, screenshots: string[], achievements: any[], mod: ModMetadata) {
        this.name = name;
        this.folderName = folderName;
        this.globalSave = globalSave;
        this.screenshots = screenshots;
        this.achievements = achievements;
        this.mod = mod;
    }
}

class ModMetadata {
    public readonly name: string;
    public readonly description: string;
    public readonly author: string;
    public readonly uses_sdk: boolean;
    public readonly sayonika_id: string;
    public readonly discord: string;
    public readonly website: string;

    constructor(name: string, description: string, author: string, uses_sdk: boolean, sayonika_id: string, discord: string, website: string) {
        this.name = name;
        this.description = description;
        this.author = author;
        this.uses_sdk = uses_sdk;
        this.sayonika_id = sayonika_id;
        this.discord = discord;
        this.website = website;

    }
}