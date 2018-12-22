/**
 * Represents the metadata of an installed mod.
 */
export default class Install {
    public readonly name: string;
    public readonly folderName: string;
    public readonly globalSave: boolean;
    public readonly screenshots: string[];
    public readonly mod: any;

    constructor(name: string, folderName: string, globalSave: boolean, screenshots: string[], mod: any) {
        this.name = name;
        this.folderName = folderName;
        this.globalSave = globalSave;
        this.screenshots = screenshots;
        this.mod = mod;
    }
}