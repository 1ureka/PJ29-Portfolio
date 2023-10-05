const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, "images/icon/computer_folder.png"),
    frame: false,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.loadFile("index.html");
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("close-app", () => {
  app.quit(); // 關閉應用程序
});

ipcMain.handle("getImages", async () => {
  const projectFolder = path.join(__dirname, "images/jpg");
  const subfolders = ["Nature", "Props", "Scene"];
  const imagePaths = {};

  for (const [index, subfolder] of subfolders.entries()) {
    const subfolderPath = path.join(projectFolder, subfolder);
    try {
      const files = await fs.promises.readdir(subfolderPath);
      const subfolderImageFiles = files.filter((file) => file.endsWith(".jpg"));
      const subfolderImagePaths = subfolderImageFiles.map((file) =>
        path.join(subfolderPath, file)
      );
      imagePaths[index] = subfolderImagePaths;
    } catch (error) {
      console.error(`Error reading image files in ${subfolder}:`, error);
    }
  }

  return imagePaths;
});
