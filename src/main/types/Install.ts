import {MonikaExportStatus} from "./MonikaExportStatus";
import {ModMetadata} from "./ModMetadata";

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
    public monikaExportStatus: MonikaExportStatus;

    constructor(name: string, folderName: string, globalSave: boolean, screenshots: string[], achievements: any[], mod: ModMetadata, playTime: number, category: string, monikaExportStatus: MonikaExportStatus) {
        this.name = name;
        this.folderName = folderName;
        this.globalSave = globalSave;
        this.screenshots = screenshots;
        this.achievements = achievements;
        this.mod = mod;
        this.playTime = playTime;
        this.category = category;
        this.monikaExportStatus = monikaExportStatus;
    }
}

