const child_process = require("child_process");
const path = require("path");
const fs = require("fs-extra");

const ddmmjson = require("../ddmm.json");
const ui_version = ddmmjson.ui.match(/^https:\/\/([\d\w-]+)\./)[1].replace(/-/g, ".");

let cwd = path.join(__dirname, "../dist/ui-bundle");

function runCommand(command) {
    return new Promise(((resolve, reject) => {
        child_process.exec(command, {cwd},err => {
            if (err) reject(err);
            else resolve();
        });
    }));
}

(async () => {
    console.log("Bundling UI");
    await fs.mkdirp(cwd);
    console.log("Cloning");
    await runCommand("git clone https://github.com/DokiDokiModManager/DDMM-UI ui");
    cwd = path.join(cwd, "ui");
    console.log("Checking out version " + ui_version);
    await runCommand("git checkout " + ui_version)
    console.log("Installing dependencies");
    await runCommand("yarn");
    console.log("Building UI");
    await runCommand("yarn build");
    console.log("Moving to new folder")
    await fs.move(path.join(cwd, "dist"), path.join(__dirname, "../dist/ui"));
    console.log("Done!");
})();
