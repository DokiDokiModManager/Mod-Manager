/**
 * Represents the metadata of an installed mod.
 */
export default class Install {
    public name: string;
    public folderName: string;
    public globalSave: boolean;
    public screenshots: string[];
    public mod: ModMetadata;
    public achievements: any[]; // TODO: set up type defs
    public playTime: number;
    public category: string;

    constructor(name: string, folderName: string, globalSave: boolean, screenshots: string[], achievements: any[], mod: ModMetadata, playTime: number, category: string) {
        this.name = name;
        this.folderName = folderName;
        this.globalSave = globalSave;
        this.screenshots = screenshots;
        this.achievements = achievements;
        this.mod = mod;
        this.playTime = playTime;
        this.category = category;
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