export class ModMetadata {
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