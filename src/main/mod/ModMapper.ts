export abstract class ModMapper {

    private readonly filesToDelete: string[];

    public constructor(filesToDelete?: string[]) {
        this.filesToDelete = filesToDelete || [];
    }

    public abstract mapFile(path: string): string;

    public abstract getFriendlyName(): string;

    public getFilesToDelete(): string[] {
        return this.filesToDelete;
    }
}
