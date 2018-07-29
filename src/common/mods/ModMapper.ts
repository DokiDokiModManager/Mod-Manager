export abstract class ModMapper {

    private readonly filesToDelete: string[];

    // no it can't
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    public constructor(filesToDelete?: string[]) {
        this.filesToDelete = filesToDelete || [];
    }

    public abstract mapFile(path: string): string;

    public abstract getFriendlyName(): string;

    public getFilesToDelete(): string[] {
        return this.filesToDelete;
    }
}