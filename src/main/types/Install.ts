/**
 * Represents the metadata of an installed mod.
 */
export default class Install {
    public readonly name: string;
    public readonly folderName: string;
    public readonly globalSave: boolean;

    constructor(name: string, folderName: string, globalSave: boolean) {
        this.name = name;
        this.folderName = folderName;
        this.globalSave = globalSave;
    }
}