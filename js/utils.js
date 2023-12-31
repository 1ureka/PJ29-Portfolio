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
 * 用於處理圖片縮放與拖曳的類別。
 */
class ImageZoom {
  /**
   * ImageZoom 類別的建構函數。
   * @param {jQuery} image - jQuery 對象，代表要進行縮放與拖曳的圖片。
   */
  constructor(image) {
    this._image = image;
    this._container = image.parent();

    this._isDrag = false;
    this._isBind = false;
    this._scale = 1;
    this._mouseX = 0;
    this._mouseY = 0;
    this._lastX = 0;
    this._lastY = 0;
    this._translateX = 0;
    this._translateY = 0;
    this._interval = null;

    this._handlers = {
      mousedown: (e) => {
        e.preventDefault();

        if (e.which === 1) this._startDragging();

        if (e.which === 3) this.reset();
      },
      mouseup: (e) => {
        e.preventDefault();

        if (e.which === 1 && this._isDrag) this._stopDragging();
      },
      mousemove: (e) => {
        e.preventDefault();

        this._mouseX = e.clientX;
        this._mouseY = e.clientY;

        if (this._isDrag) this._dragging();
      },
      mousewheel: (e) => {
        this._scaling(e.originalEvent.deltaY, e.shiftKey ? 0.2 : 0.1);
      },
    };
  }

  /**
   * 更新圖片的轉換效果。
   * @param {number} time - 動畫的持續時間（毫秒）。
   * @param {string} ease - 動畫的緩和函數。
   * @returns {Promise<void>} 當動畫完成時解析的 Promise。
   * @private
   */
  async _updateTransform(time, ease) {
    return new Promise((resolve) => {
      gsap
        .timeline({
          defaults: { duration: time / 1000, ease: ease },
          onComplete: resolve,
        })
        .to(this._image, { x: this._translateX, y: this._translateY })
        .to(this._container, { scale: this._scale }, "<");
    });
  }

  /**
   * 限制拖曳的範圍，避免圖片移動超出邊界。
   * @private
   */
  _limitTranslation() {
    if (
      Math.abs(this._translateX * 2) > this._image.width() ||
      Math.abs(this._translateY * 2) > this._image.height()
    ) {
      this._translateX = 0;
      this._translateY = 0;
      this._updateTransform(500, "back.inOut(2)");
    }
  }

  /**
   * 開始拖曳圖片。
   * @private
   */
  _startDragging() {
    $("body").css("cursor", "grab");

    this._isDrag = true;

    this._interval = setInterval(() => {
      this._lastX = this._mouseX;
      this._lastY = this._mouseY;
    }, 10);
  }

  /**
   * 停止拖曳圖片。
   * @private
   */
  _stopDragging() {
    $("body").css("cursor", "auto");

    this._isDrag = false;

    clearInterval(this._interval);

    this._limitTranslation();
  }

  /**
   * 處理拖曳中的操作。
   * @private
   */
  _dragging() {
    $("body").css("cursor", "grabbing");

    const deltaX = (this._mouseX - this._lastX) / this._scale;
    const deltaY = (this._mouseY - this._lastY) / this._scale;

    if (Math.abs(deltaX) + Math.abs(deltaY) > 150 / this._scale) return;

    if (deltaX !== 0 || deltaY !== 0) {
      this._translateX += deltaX;
      this._translateY += deltaY;
      this._updateTransform(0, "none");
    }
  }

  /**
   * 處理縮放操作。
   * @param {number} deltaY - 滾輪滾動的距離。
   * @param {number} scaleFac - 縮放因子。
   * @private
   */
  _scaling(deltaY, scaleFac) {
    if (deltaY < 0) {
      this._translateX -=
        (this._mouseX - window.innerWidth / 2) / 7 / this._scale;
      this._translateY -=
        (this._mouseY - window.innerHeight / 2) / 7 / this._scale;
      this._scale += scaleFac;
      this._updateTransform(100, "linear");

      this._limitTranslation();
    } else {
      if (this._scale <= 1) return;

      this._scale -= scaleFac;
      this._updateTransform(100, "linear");
    }
  }

  /**
   * 啟動事件綁定，開始處理圖片拖曳與縮放。
   */
  on() {
    if (this._isBind) return;

    this._isBind = true;

    $(document).on("contextmenu", (e) => e.preventDefault());

    Object.keys(this._handlers).forEach((eventType) => {
      $(document).on(eventType, this._handlers[eventType]);
    });
  }

  /**
   * 解除事件綁定，停止處理圖片拖曳與縮放。
   */
  off() {
    if (!this._isBind) return;

    this._isBind = false;

    $(document).off("contextmenu");

    Object.keys(this._handlers).forEach((eventType) => {
      $(document).off(eventType, this._handlers[eventType]);
    });
  }

  /**
   * 重置圖片的縮放與拖曳效果。
   * @returns {Promise<void>} 當重置完成時解析的 Promise。
   */
  async reset() {
    if (this._translateX === 0 && this._translateY === 0 && this._scale === 1)
      return;

    this._translateX = 0;
    this._translateY = 0;
    this._scale = 1;

    await this._updateTransform(500, "back.inOut(2)");
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
  const encodedString = url.match(/[^/\\]+$/)[0].replace(/\.jpg/, "");
  const decodedString = decodeURIComponent(encodedString);
  return decodedString;
}

/**
 * 獲取以給定索引為中心，上下共五個元素的陣列片段，考慮環狀狀態。
 * @param {number} index - 陣列中的索引，用作片段的中心。
 * @param {Array} list - 目標陣列。
 * @returns {Array} - 以給定索引為中心的五個元素的陣列片段。
 */
function getArraySegment(index, list) {
  const length = list.length;
  const result = [];

  for (let i = index - 2; i <= index + 2; i++) {
    const nIndex = (i + length) % length;
    result.push(list[nIndex]);
  }

  return result;
}
