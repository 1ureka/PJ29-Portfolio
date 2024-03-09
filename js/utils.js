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
 * 這是一個使用 Fabric.js 的 Canvas 類別的管理工具
 */
class CustomCanvas {
  /**
   * 創建一個新的 MyCanvas 實例
   * @param {*} target - 要附著到的DOM(必須已經渲染)
   * @constructor
   */
  constructor(target) {
    const { container, id } = this._create();
    this.element = container.appendTo(target);
    this._parent = target;

    /**
     * Canvas 對象
     * @type {fabric.Canvas}
     * @private
     */
    this.CANVAS = new fabric.Canvas(id, {
      hoverCursor: "grab",
      moveCursor: "grabbing",
      stopContextMenu: true,
    });

    this._resizeCanvas();

    /**
     * 事件處理程序
     * @type {Object.<string, Function>}
     * @private
     */
    this._handlers = {
      zoom: (event) => {
        const image = this.CANVAS.getObjects()[0];
        const { e } = event;
        this._startZoom(image, e);
      },
      move: () => {
        const image = this.CANVAS.getObjects()[0];
        this._limit(image);
      },
      dbclick: () => {
        const image = this.CANVAS.getObjects()[0];
        this._resetZoom(image);
      },
      resize: () => {
        const image = this.CANVAS.getObjects()[0];
        this._resizeCanvas();
        if (image) this._limit(image);
      },
    };

    this._isbind = false;

    $(window).on("resize", this._handlers.resize);
  }

  /**
   * 創建元素
   */
  _create() {
    const id = idGenerator.generateUUID();
    const container = $("<div>")
      .addClass("preview-canvas-container")
      .append(
        $("<canvas>").attr("id", id),
        $("<div>")
          .addClass("canvas-mask")
          .append($("<div>"), $("<div>"), $("<div>"), $("<div>"))
      );

    return { container, id };
  }

  /**
   * 繪製圖像到 Canvas
   * @param {string} url - 圖像的 URL
   */
  paintImage(url) {
    const objects = this.CANVAS.getObjects();

    if (objects.length > 0) {
      objects.map((object) => {
        this.CANVAS.remove(object);
      });
    }

    if (this._isbind) this._unbindEvents();

    fabric.Image.fromURL(url, async (img) => {
      const scaleX = this.CANVAS.width / img.width;
      const scaleY = this.CANVAS.height / img.height;
      const scale = Math.max(scaleX, scaleY);

      img.hasControls = false;

      img.scale(scale);

      this.CANVAS.viewportCenterObject(img);
      this.CANVAS.add(img);

      this._resetZoom(img);
    });

    this._bindEvents();
  }

  /**
   * 限制圖像的提示出現
   * @param {string} direction - 限制位置
   * @private
   */
  async _limitHint(direction) {
    const maskContainer = this.element.find(".canvas-mask");

    maskContainer.addClass(direction);
    await delay(500);
    maskContainer.removeClass(direction);
  }

  /**
   * 限制圖像的移動範圍
   * @param {fabric.Image} image - 圖像對象
   * @private
   */
  _limit(image) {
    const imgWidth = image.width * image.scaleX;
    const imgHeight = image.height * image.scaleY;
    const imgLeft = image.left;
    const imgRight = image.left + imgWidth;
    const imgTop = image.top;
    const imgBottom = image.top + imgHeight;

    // 限制拖曳範圍，讓圖片緊貼Canvas的邊界
    const { tl, br } = this.CANVAS.calcViewportBoundaries();
    const left = tl.x;
    const right = br.x;
    const top = tl.y;
    const bottom = br.y;

    // 檢查是否超出邊界，如果是，則設置座標
    if (imgLeft > left) {
      image.left = left;
      this._limitHint("left");
    }
    if (imgTop > top) {
      image.top = top;
      this._limitHint("top");
    }
    if (imgRight < right) {
      image.left = right - imgWidth;
      this._limitHint("right");
    }
    if (imgBottom < bottom) {
      image.top = bottom - imgHeight;
      this._limitHint("bottom");
    }
  }

  /**
   * 開始縮放 Canvas
   * @param {fabric.Image} image - 圖像對象
   * @param {MouseEvent} event - 事件對象
   * @private
   */
  _startZoom(image, event) {
    const { deltaY, offsetX, offsetY } = event;

    const startZoom = this.CANVAS.getZoom();
    const targetZoom = clamp(1, startZoom - deltaY / 200, 6);

    const getProgress = () => {
      return $("body").css("--zoomProgress");
    };
    const onUpdate = () => {
      this.CANVAS.zoomToPoint(
        { x: offsetX, y: offsetY },
        (targetZoom - startZoom) * getProgress() + startZoom
      );
      this._limit(image);
    };

    gsap.fromTo(
      "body",
      { "--zoomProgress": 0 },
      {
        "--zoomProgress": 1,
        duration: 0.15,
        onUpdate,
      }
    );
  }

  /**
   * 重置 Canvas 的縮放
   * @param {fabric.Image} image - 圖像對象
   * @private
   */
  _resetZoom(image) {
    this.CANVAS.setZoom(1);
    this.CANVAS.viewportCenterObject(image);
  }

  /**
   * 調整 Canvas 的大小
   * @private
   */
  _resizeCanvas() {
    const width = $(this._parent).innerWidth();
    const height = $(this._parent).innerHeight();
    this.CANVAS.setDimensions({ width, height });
  }

  /**
   * 啟用 Canvas 的事件監聽
   *  @private
   */
  _bindEvents() {
    if (this._isbind) console.warn("重複呼叫了 _bindEvents");
    this.CANVAS.on("mouse:wheel", this._handlers.zoom);
    this.CANVAS.on("object:moving", this._handlers.move);
    this.CANVAS.on("mouse:dblclick", this._handlers.dbclick);
    this._isbind = true;
  }

  /**
   * 停用 Canvas 的事件監聽
   *  @private
   */
  _unbindEvents() {
    if (!this._isbind) console.warn("重複呼叫了 _unbindEvents");
    this.CANVAS.off("mouse:wheel", this._handlers.zoom);
    this.CANVAS.off("object:moving", this._handlers.move);
    this.CANVAS.off("mouse:dblclick", this._handlers.dbclick);
    this._isbind = false;
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
 * 類似minMax。
 * @param {number} min @param {number} value @param {number} max
 * @returns {number}
 */
function clamp(min, value, max) {
  return Math.min(Math.max(value, min), max);
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
 * 壓縮圖片並返回 base64 編碼的數據 URL。
 * @param {File} file - 要壓縮的圖片檔案。
 * @param {number} width - 壓縮後圖片的寬度。
 * @param {number} height - 壓縮後圖片的高度。
 * @returns {Promise<string>} 返回壓縮後圖片的 base64 編碼的數據 URL。
 */
async function compressImage(file, width, height) {
  let quality = 1.0;
  let retryCount = 0;
  let blob = { size: 1024 * 1024 * 2 };

  while (blob.size > 1024 * 1024 && retryCount < 8) {
    console.log(`第${retryCount + 1}次壓縮圖片中`);
    quality -= 0.1 * (retryCount + 1); // Adjust quality based on retry count
    blob = await new Promise((resolve) => {
      new Compressor(file, {
        width,
        height,
        mimeType: "image/webp",
        convertSize: Infinity,
        quality,
        success: resolve,
      });
    });
    retryCount++;
  }

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
async function uploadFile(file, path, message = "PJ29/upload") {
  message += ` ${Date()}`;
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
async function deleteFile(path, message = "PJ29/delete") {
  message += ` ${Date()}`;
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
