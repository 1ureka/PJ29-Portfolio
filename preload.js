const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  closeApp: () => ipcRenderer.send("closeApp"),
  restartApp: () => ipcRenderer.send("restartApp"),
  getImages: () => ipcRenderer.invoke("getImages"),
});
