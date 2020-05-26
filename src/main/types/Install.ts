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
    public archived: boolean;
}

