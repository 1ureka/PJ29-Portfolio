/**
 * 取得圖片url.json
 * @type {Promise<{Nature: string[], Props: string[], Scene: string[]}>}
 */
const loadJson = new Promise((resolve, reject) => {
  function successFunction(result) {
    resolve(result);
  }

  function errorFunction(_, status, error) {
    const errorInstance = new Error(
      `AJAX error! Status: ${status}, Error: ${error}`
    );
    reject(errorInstance);
  }

  const config = {
    url: "imagesUrls.json",
    dataType: "json",
    success: successFunction,
    error: errorFunction,
  };

  $.ajax(config);
});

/**
 * 異步函數，用來加載圖片 URL。
 */
async function loadImageUrls() {
  try {
    const imagesUrls = await loadJson;

    const natureUrl = imagesUrls["Nature"];
    const propsUrl = imagesUrls["Props"];
    const sceneUrl = imagesUrls["Scene"];
    const jpgUrl = [...natureUrl, ...propsUrl, ...sceneUrl];

    return { jpgUrl, natureUrl, propsUrl, sceneUrl };
  } catch (error) {
    console.error(error.message);

    throw error;
  }
}

/**
 * 異步函數，用來預載圖片。
 * @param {string[]} jpgUrl - 圖片的 URL 陣列
 */
async function loadImages(jpgUrl) {
  const queue = new createjs.LoadQueue();

  const loadImagesPromise = new Promise((resolve, reject) => {
    queue.addEventListener("progress", (e) => {
      console.log(`載入圖片：${(e.progress * 100).toFixed(0)}%`);
    });
    queue.addEventListener("complete", () => {
      resolve();
      console.log("解析DOM...");
    });
    queue.addEventListener("error", reject);

    queue.loadManifest(jpgUrl);
  });

  await loadImagesPromise;
}
