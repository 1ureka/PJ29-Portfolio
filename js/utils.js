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
    this.progressHandler = () => {};
  }

  /**
   * 異步載入主進程。
   */
  async load(fileCollection) {
    const categories = Object.keys(fileCollection);
    this.categoriesAmount = categories.length;

    for (const category of categories) {
      await this._loadImages(category, fileCollection[category]);
    }

    this.progressHandler({ name: "載入完成", state: 100 });
  }

  /**
   * 異步載入指定類別的圖片。
   * @private
   * @param {string} category - 圖片類別。
   * @param {Object[]} fileList - 檔案資訊陣列。
   */
  async _loadImages(category, fileList) {
    const manifest = this._createManifest(fileList);
    const lcCategory = category.toLowerCase();

    this.quenes[lcCategory] = new createjs.LoadQueue(false);

    await new Promise((resolve) => {
      this.quenes[lcCategory].on("complete", () => {
        this.progressHandler({
          name: `載入 ${category} 資料夾`,
          state: 100,
        });
        resolve();
      });

      this.quenes[lcCategory].on("progress", (e) => {
        this.progressHandler({
          name: `載入 ${category} 資料夾`,
          state: e.progress * 100,
        });
      });

      this.quenes[lcCategory].loadManifest(manifest);
    });

    this.images[lcCategory] = fileList.map((info) => {
      const url = info.url;
      delete info.url;
      info.src = url;

      return info;
    });
  }

  /**
   * 根據圖片URL陣列創建manifest物件。
   * @private
   * @param {Object[]} fileList - 檔案資訊陣列。
   * @returns {[{ id: string, src: string }]} 用於載入的manifest物件。
   */
  _createManifest(fileList) {
    const manifest = fileList.map((info) => {
      return {
        id: info.name,
        src: info.url,
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

  /**
   * 可利用縮圖或原圖url尋找圖片名稱
   * @param {string} url - 縮圖或原圖url
   * @returns {Object} - 圖片資訊
   */
  findImageInfo(url) {
    const result = Object.values(this.images)
      .map((list) =>
        list.filter((info) => info.src === url || info.origin === url)
      )
      .flat();

    return result[0];
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

/**
 * 壓縮圖片並返回 base64 編碼的數據 URL。
 * @param {File} file - 要壓縮的圖片檔案。
 * @param {number} width - 壓縮後圖片的寬度。
 * @param {number} height - 壓縮後圖片的高度。
 * @returns {Promise<string>} 返回壓縮後圖片的 base64 編碼的數據 URL。
 */
async function compressImage(file, width, height) {
  const blob = await new Promise((resolve) => {
    new Compressor(file, {
      width,
      height,
      mimeType: "image/webp",
      convertSize: Infinity,
      success: resolve,
    });
  });

  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(blob);
  });

  return dataUrl;
}

/**
 * 用於驗證身份，自動從session拿取資料
 * @returns {Promise<boolean>} 驗證是否通過
 */
async function checkInfo() {
  const username = sessionStorage.getItem("username");
  const password = sessionStorage.getItem("password");

  if (!username || !password) return false;

  window.dispatchEvent(new Event("check"));

  const result = await new Promise((resolve) =>
    window.addEventListener("checkedResult", (e) => resolve(e.detail.result), {
      once: true,
    })
  );

  return result;
}

/**
 * 上傳具有指定編碼的文件至指定路徑。
 * @param {string} file - 文件內容的 Base64 編碼。
 * @param {string} path - 欲上傳的路徑。
 * @param {string} [message="Upload file"] - 上傳的提交訊息。
 * @returns {Promise<void>} 當上傳完成時解析的 Promise。
 */
async function uploadFile(file, path, message = "Upload file") {
  const currentDate = new Date().toISOString().split("T")[0];
  message += ` ${currentDate}`;

  const detail = { file, path, message };
  window.dispatchEvent(new CustomEvent("uploadFile", { detail }));

  await new Promise((resolve) => {
    window.addEventListener("uploadFileComplete", resolve, {
      once: true,
    });
  });
}

/**
 * 加載指定路徑的文件。
 * @param {string} path - 文件的路徑。
 * @returns {Promise<string>} 包含文件內容編碼而成的Base64的 Promise。
 */
async function loadFile(path) {
  const detail = { path };
  window.dispatchEvent(new CustomEvent("loadFile", { detail }));

  const { content } = await new Promise((resolve) => {
    window.addEventListener("loadFileComplete", (e) => resolve(e.detail), {
      once: true,
    });
  });

  return content;
}

/**
 * 刪除指定路徑的文件。
 * @param {string} path - 文件的路徑。
 * @param {string} [message="Delete file"] - 刪除的提交訊息。
 * @returns {Promise<void>} 當刪除完成時解析的 Promise。
 */
async function deleteFile(path, message = "Delete file") {
  const detail = { path, message };
  window.dispatchEvent(new CustomEvent("deleteFile", { detail }));

  await new Promise((resolve) => {
    window.addEventListener("deleteFileComplete", resolve, {
      once: true,
    });
  });
}

/**
 * 將字符串轉換為 Base64 編碼。
 * @param {string} str - 要進行編碼的字符串。
 * @returns {string} - 返回 Base64 編碼的結果。
 */
function stringToBase64(str) {
  const encoder = new TextEncoder();
  const utf8Bytes = encoder.encode(str);
  return btoa(String.fromCharCode.apply(null, utf8Bytes));
}

/**
 * 將 Base64 編碼的字符串轉換為原始字符串。
 * @param {string} encodedStr - 要進行解碼的 Base64 編碼字符串。
 * @returns {string} - 返回解碼後的原始字符串。
 */
function base64ToString(encodedStr) {
  const decoder = new TextDecoder();
  const utf8Bytes = new Uint8Array(
    atob(encodedStr)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
  return decoder.decode(utf8Bytes);
}

/**
 * 將 Data URL 轉換為 Base64 字符串。
 * @param {string} dataUrl - 要轉換的 Data URL 字符串。
 * @returns {string} - 返回 Base64 字符串。
 */
function dataUrlToBase64(dataUrl) {
  // Data URL 字符串：data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
  return dataUrl.split(",")[1];
}

/**
 * 將 Base64 字符串轉換為 Data URL。
 * @param {string} string - 要轉換的 Base64 字符串。
 * @param {string} fileType - 文件類型（例如：'png'、'jpeg' 等）。
 * @returns {string} - 返回轉換後的 Data URL。
 */
function base64ToDataUrl(string, fileType) {
  return `data:image/${fileType};base64,${string}`;
}

/**
 * 將圖片添加到資料庫。
 * @param {Object[]} manifest - 包含多個物件的數組。
 * @param {string} manifest[].category - 目標分類。
 * @param {string} manifest[].url1 - 原圖base64編碼。
 * @param {string} manifest[].url2 - 縮圖base64編碼。
 * @param {string} manifest[].name - 檔名。
 */
async function addImages(manifest) {
  for (const info of manifest) {
    await uploadFile(info.url1, `PJ29/thumbnail/${info.category}/${info.name}`);
    await uploadFile(info.url2, `PJ29/origin/${info.category}/${info.name}`);

    let base64;
    let json;

    base64 = await loadFile("PJ29/dict.json");
    json = JSON.parse(base64ToString(base64));

    json[info.category].push(info.name);
    json[info.category] = [...new Set(json[info.category])].sort();

    json = JSON.stringify(json, null, 2);
    base64 = stringToBase64(json);
    await uploadFile(base64, "PJ29/dict.json");
  }
}

/**
 * 從資料庫刪除圖片。
 * @param {Object[]} manifest - 包含多個物件的數組。
 * @param {string} manifest[].category - 目標分類。
 * @param {string} manifest[].name - 檔名。
 */
async function deleteImages(manifest) {
  for (const info of manifest) {
    await deleteFile(`PJ29/thumbnail/${info.category}/${info.name}`);
    await deleteFile(`PJ29/origin/${info.category}/${info.name}`);

    let base64;
    let json;

    base64 = await loadFile("PJ29/dict.json");
    json = JSON.parse(base64ToString(base64));

    json[info.category] = json[info.category]
      .filter((name) => name !== info.name)
      .sort();

    json = JSON.stringify(json, null, 2);
    base64 = stringToBase64(json);
    await uploadFile(base64, "PJ29/dict.json");
  }
}

/**
 * 同步資料庫圖片。
 * @returns {Promise<Object>} 包含從資料庫同步的圖片資訊的物件。
 */
async function syncImages() {
  base64 = await loadFile("PJ29/dict.json");
  json = JSON.parse(base64ToString(base64));

  const categories = json;

  const manifest = {};

  for (const category in categories) {
    for (const name of categories[category]) {
      const thumbnail = await loadFile(`PJ29/thumbnail/${category}/${name}`);
      const origin = await loadFile(`PJ29/origin/${category}/${name}`);
      const info = { url1: thumbnail, url2: origin, name: name };
      manifest[category].push(info);
    }
  }

  return manifest;
}
