const child_process = require("child_process");
const path = require("path");
const fs = require("fs-extra");

function runCommand(command, cwd) {
    return new Promise(((resolve, reject) => {
        console.log(" > " + command);
        child_process.exec(command, {cwd},err => {
            if (err) reject(err);
            else resolve();
        });
    }));
}

const PATH_TO_UI = path.join(__dirname, "../ui");
console.log("[Bundling UI: " +  PATH_TO_UI + "]");

(async () => {
    await runCommand("yarn install --frozen-lockfile", PATH_TO_UI);
    await runCommand("yarn run build", PATH_TO_UI);
})();
