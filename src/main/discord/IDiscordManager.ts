export default interface IDiscordManager {
    setIdleStatus(): void;
    setPlayingStatus(installName: string): void;
    shutdown(): void;
}
