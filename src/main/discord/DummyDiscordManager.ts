import IDiscordManager from "./IDiscordManager";

export default class DummyDiscordManager implements IDiscordManager {

    setIdleStatus(): void {}

    setPlayingStatus(installName: string): void {}

    shutdown(): void {}

}
