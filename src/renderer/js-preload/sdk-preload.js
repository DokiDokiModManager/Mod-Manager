const {ipcRenderer} = require("electron");

function appendLog(text, clazz) {
    const logElement = document.querySelector("#log");
    const newElement = document.createElement("div");
    newElement.innerText = text;
    newElement.classList.add(clazz);
    logElement.appendChild(newElement);
    window.scrollTo({top: document.body.scrollHeight});
}

ipcRenderer.on("log", (_, log) => {
    appendLog(log.text, log.clazz);
});