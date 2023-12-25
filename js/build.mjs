import { readdirSync, writeFileSync } from "fs";
import { join } from "path";

const mainfolder = "images/thumbnail";
const subfolders = ["Nature", "Props", "Scene"];
const imagePaths = {};

for (const subfolder of subfolders) {
  const subfolderPath = join(mainfolder, subfolder);

  try {
    const allFiles = readdirSync(subfolderPath);
    const jpgFiles = allFiles.filter((file) => file.endsWith(".jpg"));
    const jpgPaths = jpgFiles.map((file) =>
      join(subfolderPath, file).replace(/\\/g, "/")
    );

    imagePaths[subfolder] = jpgPaths;
  } catch (error) {
    console.log("Error reading image files");
  }
}

const jsonContent = JSON.stringify(imagePaths, null, 2);

try {
  writeFileSync("imagesUrls.json", jsonContent);
  console.log("Image URLs written to imagesUrls.json");
} catch (error) {
  console.error("Error writing to imagesUrls.json");
}
