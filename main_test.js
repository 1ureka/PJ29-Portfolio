const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, "images/icon/computer_folder.png"),
    show: false,
    frame: false,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.loadFile("index.html");
  mainWindow.webContents.openDevTools();
  mainWindow.once("ready-to-show", () => {
    mainWindow.show(); // 在準備好時顯示主窗口
  });
}

app.whenReady().then(() => {
  createWindow();
});

ipcMain.on("closeApp", () => {
  app.quit();
});

ipcMain.on("restartApp", () => {
  app.relaunch();
  app.quit();
});

ipcMain.handle("getImages", async () => {
  const mainfolder = path.join(__dirname, "images/jpg");
  const subfolders = ["Nature", "Props", "Scene"];
  const imagePaths = {};

  for (const subfolder of subfolders) {
    const subfolderPath = path.join(mainfolder, subfolder);
    try {
      const allFiles = await fs.promises.readdir(subfolderPath);
      const jpgFiles = allFiles.filter((file) => file.endsWith(".jpg"));
      const jpgPaths = jpgFiles.map((file) => path.join(subfolderPath, file));

      imagePaths[subfolder] = jpgPaths;
    } catch (error) {
      console.error(`Error reading image files in ${subfolder}:`, error);
    }
  }

  return imagePaths;
});
