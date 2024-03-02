/**
 * 用於與圖片資料庫溝通。
 */
class Images {
  constructor() {
    /**
     * @typedef {Object.<string, string[]>} ImageCollectionByCategory
     * @description 代表一個按類別分組的圖像集合，其中每個鍵是類別名稱，值是圖像名稱的數組。
     */

    /**
     * @type {ImageCollectionByCategory}
     */
    this._fileList = null;

    /**
     * @typedef {Object} ImageDetails
     * @property {string} thumbnail - 縮略圖像的 URL 或資料 URL。
     * @property {string} origin - 原始圖像的 URL 或資料 URL。
     */

    /**
     * @typedef {Object.<string, ImageDetails>} ImageCategory
     * @description 代表一個圖像類別的物件，其中每個鍵是圖像名稱，值是 ImageDetails 物件。
     */

    /**
     * @typedef {Object.<string, ImageCategory>} ImageCollection
     * @description 代表一個按類別分組的圖像集合，其中每個鍵是類別名稱，值是 ImageCategory 物件。
     */

    /**
     * @type {ImageCollection}
     */
    this._images = {};
    this._initialTitle = document.title;
  }

  /**
   * 用於設定目前狀態
   * @param {boolean} isAsync - 是否為非同步狀態
   */
  _setState(isAsync) {
    if (isAsync) {
      document.title = this._initialTitle + " ( 未同步 )";
      $("#content").css("pointerEvents", "none");
    } else {
      document.title = this._initialTitle;
      $("#content").css("pointerEvents", "auto");
    }
  }

  /**
   * 返回目前的檔案結構，若本地沒有，會從資料庫拿。
   */
  async getList() {
    let fileList;

    if (!this._fileList) {
      const base64 = await loadFile("PJ29/dict.json");
      fileList = JSON.parse(base64ToString(base64));
      this._fileList = fileList;
    } else {
      fileList = this._fileList;
    }

    return fileList;
  }

  /**
   * 將圖片添加到資料庫。
   * @param {Object[]} manifest - 包含多個物件的數組。
   * @param {string} manifest[].category - 目標分類。
   * @param {string} manifest[].url1 - 原圖base64編碼。
   * @param {string} manifest[].url2 - 縮圖base64編碼。
   * @param {string} manifest[].name - 檔名。
   */
  async addImages(manifest) {
    let fileList = await this.getList();

    const promises = manifest.map(async (info) => {
      const { category, url1, url2, name } = info;

      await uploadFile(url1, `PJ29/origin/${info.category}/${info.name}`);
      await uploadFile(url2, `PJ29/thumbnail/${info.category}/${info.name}`);

      fileList[category].push(name);
      fileList[category] = [...new Set(fileList[category])].sort();
    });

    await Promise.all(promises);

    const base64 = stringToBase64(JSON.stringify(fileList, null, 2));
    await uploadFile(base64, "PJ29/dict.json");

    this._setState(true);
  }

  /**
   * 從資料庫刪除圖片。
   * @param {Object[]} manifest - 包含多個物件的數組。
   * @param {string} manifest[].category - 目標分類。
   * @param {string} manifest[].name - 檔名。
   */
  async deleteImages(manifest) {
    let fileList = await this.getList();

    const promises = manifest.map(async (info) => {
      const { category, name } = info;

      await deleteFile(`PJ29/origin/${category}/${name}`);
      await deleteFile(`PJ29/thumbnail/${category}/${name}`);

      fileList[category] = fileList[category]
        .filter((fileName) => fileName !== name)
        .sort();
    });

    await Promise.all(promises);

    const base64 = stringToBase64(JSON.stringify(fileList, null, 2));
    await uploadFile(base64, "PJ29/dict.json");

    this._setState(true);
  }

  /**
   * 利用dict.json同步資料庫圖片。
   */
  async syncImages() {
    let fileList = await this.getList();
    const categories = Object.keys(fileList);

    categories.forEach((category) => {
      this._images[category] = {};
      fileList[category].forEach((fileName) => {
        this._images[category][fileName] = {};
      });
    });

    this._setState(false);
  }

  /**
   * 根據類別和識別符號獲取縮圖。
   * @param {string} category - 圖片類別。
   * @param {number|string} identifier - 圖片索引或名稱。
   */
  async getThumbnail(category, identifier) {
    const fileList = this._images[category];

    if (!fileList) return null;

    let fileName;
    if (typeof identifier === "number") {
      fileName = Object.keys(fileList)[identifier];
    } else if (typeof identifier === "string") {
      fileName = identifier;
    } else {
      return null;
    }

    if (!fileList[fileName].thumbnail) {
      const dataUrl = await loadFile(`PJ29/thumbnail/${category}/${fileName}`);
      fileList[fileName].thumbnail = base64ToDataUrl(dataUrl, "webp");
    }

    return fileList[fileName].thumbnail;
  }

  /**
   * 根據類別和識別符號獲取原圖。
   * @param {string} category - 圖片類別。
   * @param {number|string} identifier - 圖片索引或名稱。
   */
  async getImage(category, identifier) {
    const fileList = this._images[category];

    if (!fileList) return null;

    let fileName;
    if (typeof identifier === "number") {
      fileName = Object.keys(fileList)[identifier];
    } else if (typeof identifier === "string") {
      fileName = identifier;
    } else {
      return null;
    }

    if (!fileList[fileName].origin) {
      const dataUrl = await loadFile(`PJ29/origin/${category}/${fileName}`);
      fileList[fileName].origin = base64ToDataUrl(dataUrl, "webp");
    }

    return fileList[fileName].origin;
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
 * 一個用來生成唯一識別碼(UUID)的類別。
 */
class UUIDGenerator {
  /**
   * 創建一個新的UUIDGenerator實例。
   */
  constructor() {
    /**
     * @type {Set<string>} 存儲已生成的 UUID 的集合。
     */
    this.generatedIds = new Set();
  }

  /**
   * 生成一個新的UUID。
   * @returns {string} 生成的 UUID。
   */
  generateUUID() {
    let uuid;
    do {
      uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    } while (this.generatedIds.has(uuid));

    this.generatedIds.add(uuid);
    return uuid;
  }
}
// 預先創建
const idGenerator = new UUIDGenerator();

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
 * 排序物件中的鍵按字母順序排序。
 * @param {Object} unordered 未排序的物件。
 * @returns {Object} 排序後的物件。
 */
function sortByKey(unordered) {
  return Object.keys(unordered)
    .sort()
    .reduce((obj, key) => {
      obj[key] = unordered[key];
      return obj;
    }, {});
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

  const id = idGenerator.generateUUID();
  const detail = { file, path, message, id };
  window.dispatchEvent(new CustomEvent("uploadFile", { detail }));

  await new Promise((resolve) => {
    window.addEventListener(`uploadFileComplete${id}`, resolve, {
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
  const id = idGenerator.generateUUID();
  const detail = { path, id };
  window.dispatchEvent(new CustomEvent("loadFile", { detail }));

  const { content } = await new Promise((resolve) => {
    window.addEventListener(`loadFileComplete${id}`, (e) => resolve(e.detail), {
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
  const id = idGenerator.generateUUID();
  const detail = { path, message, id };
  window.dispatchEvent(new CustomEvent("deleteFile", { detail }));

  await new Promise((resolve) => {
    window.addEventListener(`deleteFileComplete${id}`, resolve, {
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
  return `data:image/${fileType};base64,${string.replace(/\n/g, "")}`;
}
