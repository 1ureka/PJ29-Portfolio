/**
 * 圖片管理器類別，用於載入並處理圖片資源。
 */
class ImageManager {
  /**
   * ImageManager的建構子，初始化內部狀態。
   */
  constructor() {
    /** 用於儲存載入佇列的物件。 @type {Object.<string, createjs.LoadQueue>} */
    this.quenes = {};
    /** 用於儲存載入的圖片物件。 @type {Object.<string, { name: string, size: number, jQuery: JQuery }>} */
    this.images = {};
    /** 用於處理載入進度的處理器函式。 */
    this.progressHandler = (log) => console.log(log);
  }

  /**
   * 異步載入圖片資源。
   */
  async load() {
    /** 獲取載入的urls物件。 @type {Object.<string, string[]>} */
    const result = await this._loadUrls();

    for (const key of Object.keys(result)) {
      const category = key;
      const urls = result[key];
      await this._loadImages(category, urls);
    }

    this.progressHandler("解析DOM . . .");
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
        this.progressHandler("載入urls: 完成");
        resolve(e.result);
      });

      queue.on("progress", (e) => {
        const progress = Math.round(e.progress * 100);
        this.progressHandler(`載入urls: ${progress}%`);
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

    this.quenes[lcCategory] = new createjs.LoadQueue();

    await new Promise((resolve) => {
      this.quenes[lcCategory].on("complete", () => {
        this.progressHandler(`載入 ${category} 資料夾的 jpg: 完成`);
        resolve();
      });

      this.quenes[lcCategory].on("progress", (e) => {
        const progress = Math.round(e.progress * 100);
        this.progressHandler(`載入 ${category} 資料夾的 jpg: ${progress}%`);
      });

      this.quenes[lcCategory].loadManifest(manifest);
    });

    this.images[lcCategory] = this.quenes[lcCategory].getItems().map((e) => {
      return { name: e.item.id, size: e.rawResult.size, JQuery: $(e.result) };
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
   * @returns {{ name: string, size: number, jQuery: JQuery } | null} 圖片物件，如果不存在則返回null。
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
   * @returns {({ name: string, size: number, jQuery: JQuery })[] | null} 圖片物件陣列，如果不存在則返回null。
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
   * @param {(log: string) => void} handler - 進度處理器函式。
   * @returns {this} ImageManager實例。
   */
  onProgress(handler) {
    this.progressHandler = handler;
    return this;
  }

  // 之後會執行排序this.images[category]
  sortBySize() {
    return this;
  }

  sortByName() {
    return this;
  }

  // 會有點難，可能得從生成imagesUrls.json時下手
  sortByDate() {
    return this;
  }
}
