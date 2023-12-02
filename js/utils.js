/**
 * 用於載入並處理圖片資源的類別。
 */
class LoadManager {
  constructor() {
    /** 用於儲存載入佇列的物件。 @type {Object.<string, createjs.LoadQueue>} */
    this.quenes = {};
    /** 用於儲存載入的圖片物件。 @type {Object.<string, { name: string, size: number, img: img, src: string }[]>} */
    this.images = {};
    /** 用於處理載入進度的處理器函式。 */
    this.progressHandler = (log) => console.log(log);
  }

  /**
   * 異步載入主進程。
   */
  async load() {
    /** 獲取載入的urls物件。 @type {Object.<string, string[]>} */
    const result = await this._loadUrls();
    const categories = Object.keys(result);
    this.categoriesAmount = categories.length;

    for (const category of categories) {
      const urls = result[category];
      await this._loadImages(category, urls);
    }

    this.progressHandler({ name: "載入完成", state: 100 });
  }

  /**
   * 異步載入urls物件。
   * @private
   * @returns {Promise<Object.<string, string[]>>} 獲取的urls物件。
   */
  async _loadUrls() {
    return new Promise((resolve) => {
      const queue = new createjs.LoadQueue();

      queue.on("fileload", (e) => {
        this.currentProgress = 10;
        this.progressHandler({ name: "載入urls", state: this.currentProgress });
        resolve(e.result);
      });

      queue.on("fileprogress", (e) => {
        this.currentProgress = e.progress * 10;
        this.progressHandler({ name: "載入urls", state: this.currentProgress });
      });

      queue.loadFile({ src: "imagesUrls.json", type: createjs.Types.JSON });
    });
  }

  /**
   * 異步載入指定類別的圖片。
   * @private
   * @param {string} category - 圖片類別。
   * @param {string[]} urls - 圖片URL陣列。
   */
  async _loadImages(category, urls) {
    const manifest = this._createManifest(urls);
    const lcCategory = category.toLowerCase();

    this.quenes[lcCategory] = new createjs.LoadQueue(false);

    await new Promise((resolve) => {
      const baseProgress = this.currentProgress;

      this.quenes[lcCategory].on("complete", () => {
        this.progressHandler({
          name: `載入 ${category} 資料夾`,
          state: this.currentProgress,
        });
        resolve();
      });

      this.quenes[lcCategory].on("progress", (e) => {
        this.currentProgress =
          baseProgress + e.progress * (90 / this.categoriesAmount);
        this.progressHandler({
          name: `載入 ${category} 資料夾`,
          state: this.currentProgress,
        });
      });

      this.quenes[lcCategory].loadManifest(manifest);
    });

    this.images[lcCategory] = this.quenes[lcCategory].getItems().map((e) => {
      return {
        name: e.item.id,
        size: e.rawResult.size,
        img: e.result,
        src: e.item.src,
      };
    });
  }

  /**
   * 根據圖片URL陣列創建manifest物件。
   * @private
   * @param {string[]} urls - 圖片URL陣列。
   * @returns {[{ id: string, src: string }]} 用於載入的manifest物件。
   */
  _createManifest(urls) {
    const manifest = urls.map((url) => {
      return {
        id: url.match(/[^/\\]+$/)[0].replace(/\.jpg/, ""),
        src: url,
      };
    });

    return manifest;
  }

  /**
   * 根據類別和識別符號獲取圖片物件。
   * @param {string} category - 圖片類別。
   * @param {number|string} identifier - 圖片索引或名稱。
   * @returns {{ name: string, size: number, img: img, src: string } | null} 圖片物件，如果不存在則返回null。
   */
  getImage(category, identifier) {
    if (!this.images[category]) return null;

    let obj;

    if (typeof identifier === "number") {
      // 如果第二個參數是數字，視為索引
      obj = this.images[category][identifier];
    } else if (typeof identifier === "string") {
      // 如果第二個參數是字串，視為名稱
      obj = this.images[category].find((item) => item.name === identifier);
    }

    return obj || null;
  }

  /**
   * 根據類別獲取整個圖片物件陣列。
   * @param {string} category - 圖片類別。
   * @returns {{ name: string, size: number, img: img, src: string }[] | null} 圖片物件陣列，如果不存在則返回null。
   */
  getImageArray(category) {
    if (!this.images[category]) return null;

    const arr = this.images[category].map((item) => {
      return item;
    });

    return arr;
  }

  /**
   * 設置載入進度處理器函式。
   * @param {(log: { name: string, state: string }) => void} handler - 進度處理器函式。
   * @returns {this} ImageManager實例。
   */
  onProgress(handler) {
    this.progressHandler = handler;
    return this;
  }
}

/**
 * 延遲執行的 Promise 函式，用於等待一定的時間。
 * @param {number} ms - 要延遲的時間（毫秒）。
 * @returns {Promise<void>} 一個 Promise，在指定時間後被解析。
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 使用 async/await 解碼圖片，如果解碼失敗，將進行重試直到成功。
 * @param {Image} image - 要解碼的圖片物件。
 * @returns {Promise<void>} 一個 Promise，在解碼完成後被解析。
 */
async function decode(image) {
  try {
    await image.decode();
  } catch (error) {
    await decode(image);
  }
}

/**
 * 從圖片url找到檔名
 * @param {string} url - 圖片的url
 * @returns {string} - 圖片的檔名
 */
function findImageName(url) {
  return url.match(/[^/\\]+$/)[0].replace(/\.jpg/, "");
}