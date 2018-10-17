# Doki Doki Mod Manager [![Build Status](https://travis-ci.org/DokiDokiModManager/Mod-Manager.svg?branch=master)](https://travis-ci.org/DokiDokiModManager/Mod-Manager) [![Greenkeeper badge](https://badges.greenkeeper.io/DokiDokiModManager/Mod-Manager.svg)](https://greenkeeper.io/)

Doki Doki Mod Manager is, as the name implies, a mod manager for Doki Doki Literature Club!

## Discord

Got any questions, suggestions or complaints? Join the Discord server!

[DDMM Discord](https://discord.me/modmanager)

## IP Guidelines

Doki Doki Mod Manager is a fan work of Doki Doki Literature Club, as defined by Team Salvato's [IP Guidelines](http://teamsalvato.com/ip-guidelines/).

## Download

Builds for Windows and Linux (AppImage) are available on the [Releases page](https://github.com/DokiDokiModManager/Mod-Manager/releases).

macOS is not currently supported and **does not work whatsoever**. However, it is on the agenda.

## Run from source

For the latest changes, or if you want to contribute, you can run DDMM from source. Note that the updater will not function if you are running from source.

    $ git clone https://github.com/DokiDokiModManager/Mod-Manager
    $ npm install
    $ npm start
    
## Debug Tools

Type `justmonika` while the app is focused to enable debug tools. This will grant you access to four new UI options:

* **Debug Crash** - forces a crash to test crash reporting.
* **Devtools** - open the Electron developer tools.
* **Inference** - test how DDMM detects the file format of a mod.
* **UI Kit** - this is just a set of UI elements for reference.

If you encounter a crash with debug tools enabled, please don't report it unless you can reproduce it without them enabled.

## License

Doki Doki Mod Manager is licensed under the [MIT License](LICENSE.txt).