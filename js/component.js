//
// 基礎 (icon, input ...)
//
/**
 * 創建包含上/下圖示的容器。
 * @returns {jQuery} 滾動圖示的容器。
 */
function createScrollIcon() {
  const container = $("<div>").addClass("scroll-icon-container");

  const img1 = $("<img>")
    .addClass("scroll-icon-img")
    .attr("src", `icons/up (white).png`);
  const img2 = $("<img>")
    .addClass("scroll-icon-img")
    .attr("src", `icons/up (dark).png`);
  gsap.set(img2, { y: 40 });

  container.append(img1, img2);
  return container;
}

/**
 * 創建包含搜尋圖示的容器。
 * @returns {jQuery} 搜尋圖示的容器。
 */
function createSearchIcon() {
  const container = $("<div>").addClass("search-icon-container");

  const lens = $("<div>").addClass("search-icon-lens");
  const inner1 = $("<div>").addClass("search-icon-inner");
  const inner2 = $("<div>").addClass("search-icon-inner");
  gsap.set(inner1.add(inner2), { rotate: 5 });
  gsap.set(inner2, { x: -10 });
  lens.append(inner1, inner2);

  const img = $("<img>")
    .addClass("search-icon-img")
    .attr("src", `icons/search.png`);

  container.append(lens, img);

  return container;
}

/**
 * 創建包含橡皮擦圖示的容器。
 * @returns {jQuery} 橡皮擦圖示的容器。
 */
function createEraserIcon() {
  const container = $("<div>").addClass("eraser-icon-container").hide();

  const img1 = $("<img>").attr("src", `icons/erase (line).png`);
  const img2 = $("<img>").attr("src", `icons/erase.png`);
  gsap.set(img2, { x: 10 });

  container.append(img1, img2);

  const t1 = createEraserIconHoverTl(container);
  const t2 = createEraserIconClickTl(container);

  container.on("mouseenter", () => t1.play());
  container.on("mouseleave", () => t1.reverse());
  container.on("click", () => t2.restart());

  return container;
}

/**
 * 創建資料夾圖示，包含圖片和前景元素。
 * @param {Object} config - 用於設定資料夾圖示的配置物件。
 * @param {string} config.imgColor - 圖片顏色。
 * @param {string} config.backgroundColor - 前景元素的背景顏色。
 * @param {string} config.borderColor - 前景元素的邊框顏色。
 * @returns {jQuery} 資料夾圖示的容器。
 */
function createFolderIcon(config) {
  // 預設配置
  const defaultConfig = {
    imgColor: "white",
    backgroundColor: "white",
    borderColor: "hsl(240, 5%, 10%)",
  };

  // 合併預設配置和用戶提供的配置
  config = { ...defaultConfig, ...config };

  const container = $("<div>").addClass("folder-icon-container");

  const img = $("<img>")
    .addClass("folder-icon-img")
    .attr("src", `icons/folder (${config.imgColor}).png`);
  const front = $("<div>")
    .addClass("folder-icon-front")
    .css("backgroundColor", config.backgroundColor)
    .css("borderColor", config.borderColor);

  container.append(img, front);

  return container;
}

/**
 * 創建包含排序圖示圖片的容器。
 * @param {boolean} darkTheme 是否是深色主題
 * @returns {jQuery} 排序圖示圖片的容器。
 */
function createSortImg(darkTheme = false) {
  const container = $("<div>").addClass("sort-img-container");

  const lines = Array.from({ length: 4 }, (_, index) =>
    $("<img>")
      .attr(
        "src",
        `icons/sort (line${index + 1})${darkTheme ? " (dark)" : ""}.png`
      )
      .css("transformOrigin", `${30 - index * 3}px ${8 + index * 8}px`)
  );

  const arrows = Array.from({ length: 2 }, () =>
    $("<img>").attr(
      "src",
      `icons/sort (arrow)${darkTheme ? " (dark)" : ""}.png`
    )
  );

  container.append(...lines, ...arrows);
  gsap.set(container.children().slice(5), { y: 40 });

  return container;
}

/**
 * 創建包含排序圖示的容器。
 * @returns {jQuery} 排序圖示的容器。
 */
function createSortIcon() {
  const container = $("<div>").addClass("sort-icon-container");

  const whiteIcon = createSortImg(false);
  const darkIcon = createSortImg(true);
  gsap.set(darkIcon, { autoAlpha: 0 });

  container.append(whiteIcon, darkIcon);

  return container;
}

/**
 * 創建垂直分隔線。
 * @param {Object} config - 用於設定分隔線的配置物件。
 * @param {number} config.margin - 分隔線的邊距。
 * @param {number} config.width - 分隔線的寬度。
 * @param {string} config.backgroundColor - 分隔線的背景顏色。
 * @returns {jQuery} 垂直分隔線。
 */
function createVerticalSeparator(config) {
  // 預設配置
  const defaultConfig = {
    margin: 5, // 預設邊距
    width: 2, // 預設粗細
    backgroundColor: "white", // 預設背景顏色
  };

  // 合併預設配置和用戶提供的配置
  config = { ...defaultConfig, ...config };

  const separator = $("<div>")
    .addClass("v-separator")
    .css({
      margin: `0 ${config.margin}px`,
      width: `${config.width}px`,
      backgroundColor: config.backgroundColor,
    });

  return separator;
}

/**
 * 創建水平分隔線。
 * @param {Object} config - 用於設定分隔線的配置物件。
 * @param {number} config.margin - 分隔線的邊距。
 * @param {number} config.height - 分隔線的高度。
 * @param {string} config.backgroundColor - 分隔線的背景顏色。
 * @returns {jQuery} 水平分隔線。
 */
function createHorizontalSeparator(config) {
  // 預設配置
  const defaultConfig = {
    margin: 5, // 預設邊距
    height: 2, // 預設粗細
    backgroundColor: "white", // 預設背景顏色
  };

  // 合併預設配置和用戶提供的配置
  config = { ...defaultConfig, ...config };

  const separator = $("<div>")
    .addClass("h-separator")
    .css({
      margin: `${config.margin}px 0`,
      height: `${config.height}px`,
      backgroundColor: config.backgroundColor,
    });

  return separator;
}

/**
 * 創建文字輸入框。
 * @param {Object} config - 用於設定文字輸入框的配置物件。
 * @returns {jQuery} 文字輸入框的容器。
 */
function createTextInput(config) {
  // 預設配置
  const defaultConfig = {
    placeholder: "文字輸入",
    width: 410,
    height: 40,
  };

  // 合併預設配置和用戶提供的配置
  config = { ...defaultConfig, ...config };

  const container = $("<div>")
    .css({ width: config.width, height: config.height })
    .addClass("text-input-container");
  const input = $("<input>")
    .attr("type", "text")
    .attr("placeholder", config.placeholder)
    .css({ width: config.width, height: config.height })
    .addClass("text-input");

  container.append(input);

  return container;
}

/**
 * 創建元素的輪廓效果。
 * @param {jQuery} element - 要添加輪廓的元素。
 * @param {Object} config - 用於設定輪廓效果的配置物件。
 * @returns {{
 *   container: jQuery,
 *   outline1: jQuery,
 *   outline2: jQuery
 * }} 包含輪廓元素的物件。
 */
function createOutline(element, config) {
  // 預設配置
  const defaultConfig = {
    outlineColor: "white",
    outlineWidth: 2,
    duration: 0.2,
  };

  // 合併預設配置和用戶提供的配置
  config = { ...defaultConfig, ...config };

  const elementContainer = element.closest("div");
  const container = $("<div>")
    .css({
      position: "absolute",
      width: elementContainer.width(),
      height: elementContainer.height(),
      clipPath: `inset(-${config.outlineWidth}px round 10px)`,
    })
    .appendTo(elementContainer);
  const outline1 = $("<div>")
    .css({
      position: "absolute",
      backgroundColor: config.outlineColor,
      borderRadius: "10px",
      bottom: -1 * config.outlineWidth,
      left: -1 * config.outlineWidth,
    })
    .appendTo(container);
  const outline2 = $("<div>")
    .css({
      position: "absolute",
      backgroundColor: config.outlineColor,
      borderRadius: "10px",
      top: -1 * config.outlineWidth,
      right: -1 * config.outlineWidth,
    })
    .appendTo(container);

  element.before(container);

  return { container, outline1, outline2 };
}

/**
 * 創建一個燈泡元素。
 * @param {Object} config - 用於配置燈泡的物件。
 * @param {number} config.width - 燈泡的寬度。
 * @param {number} config.height - 燈泡的高度。
 * @returns {jQuery} - 包含燈泡的jQuery物件。
 */
function createBulb(config) {
  // 預設配置
  const defaultConfig = {
    width: 40,
    height: 40,
  };

  // 合併預設配置和用戶提供的配置
  config = { ...defaultConfig, ...config };

  const container = $("<div>")
    .addClass("bulb-container")
    .css({
      width: `${config.width + 20}px`,
      height: `${config.height + 20}px`,
    });

  const bulb = $("<div>")
    .addClass("bulb")
    .css({ width: `${config.width}px`, height: `${config.height}px` });
  const bulbFilter = $("<div>")
    .addClass("bulb-filter")
    .css({ width: `${config.width}px`, height: `${config.height}px` })
    .appendTo(bulb);

  container.append(bulb);

  return container;
}

//
// 複雜
//
/**
 * 這個類別提供創建和控制上下滾動按鈕的功能。
 */
class ScrollButtons {
  /**
   * 建構一個新的 `ScrollButtons` 實例。@constructor
   */
  constructor() {
    this.timelines = {};
    this.handlers = {};

    this._isAppendTo = false;
    this.isShow = false;

    /**
     * 包含上下滾動按鈕的 jQuery 物件。
     * @type {jQuery}
     */
    const container = $("<div>")
      .addClass("scroll-buttons-container")
      .append(this._createScrollButton("up"), this._createScrollButton("down"));

    this.element = container;

    this._createTimelines();
  }

  /**
   * 創建上下滾動按鈕。
   * @private
   * @param {string} type - 按鈕類型，可以是 "up" 或 "down"。
   * @returns {jQuery} - 上下滾動按鈕的 jQuery 物件。
   */
  _createScrollButton(type) {
    const button = $("<button>").addClass("scroll-button").addClass(type);
    const icon = createScrollIcon();
    if (type === "down") gsap.set(icon, { rotate: 180 });

    button.append(icon);

    const t1 = createScrollButtonHoverTl(button);
    const t2 = createScrollButtonClickTl(button);

    button.on("mouseenter", () => t1.play());
    button.on("mouseleave", () => t1.reverse());
    button.on("click", () => t2.restart());

    return button;
  }

  /**
   * 創建並初始化上滾動按鈕的時間軸效果。
   * @private
   * @returns {ScrollButtons} - 回傳 `ScrollButtons` 實例，以便進行方法鏈結。
   */
  _createTimelines() {
    this.timelines.show = gsap
      .timeline({
        defaults: { ease: "back.out(4)", duration: 0.35 },
        paused: true,
      })
      .from(this.element.children(), { scale: 0.5, stagger: 0.15 })
      .from(
        this.element.children(),
        { ease: "set1", autoAlpha: 0, stagger: 0.15 },
        "<"
      );

    return this;
  }

  /**
   * 註冊上滾動按鈕的點擊事件處理程序。
   * @param {Function} handler - 點擊事件的處理程序。
   * @returns {ScrollButtons} - 回傳 `ScrollButtons` 實例，以便進行方法鏈結。
   */
  onUp(handler) {
    if (this.handlers.up) {
      console.error("onUp: 已經註冊過");
      return this;
    }

    this.handlers.up = handler;
    this.element.on("click", ".up", this.handlers.up);

    return this;
  }

  /**
   * 註冊下滾動按鈕的點擊事件處理程序。
   * @param {Function} handler - 點擊事件的處理程序。
   * @returns {ScrollButtons} - 回傳 `ScrollButtons` 實例，以便進行方法鏈結。
   */
  onDown(handler) {
    if (this.handlers.down) {
      console.error("onDown: 已經註冊過");
      return this;
    }

    this.handlers.down = handler;
    this.element.on("click", ".down", this.handlers.down);

    return this;
  }

  /**
   * 解除所有事件處理程序的註冊。
   * @returns {ScrollButtons} - 回傳 `ScrollButtons` 實例，以便進行方法鏈結。
   */
  off() {
    this.element.off("click", ".up", this.handlers.up);
    this.handlers.up = null;
    this.element.off("click", ".down", this.handlers.down);
    this.handlers.down = null;

    return this;
  }

  /**
   * 顯示上滾動按鈕。
   * @returns {ScrollButtons} - 回傳 `ScrollButtons` 實例，以便進行方法鏈結。
   */
  show() {
    if (this.isShow) return this;

    this.isShow = true;
    this.timelines.show.play();

    return this;
  }

  /**
   * 隱藏上滾動按鈕。
   * @returns {ScrollButtons} - 回傳 `ScrollButtons` 實例，以便進行方法鏈結。
   */
  hide() {
    if (!this.isShow) return this;

    this.isShow = false;
    this.timelines.show.reverse();

    return this;
  }

  /**
   * 附加上下按鈕到指定的 DOM 選擇器。
   * @param {string} selector - DOM 選擇器。
   * @returns {ScrollButtons} - 回傳 `ScrollButtons` 實例，以便進行方法鏈結。
   */
  appendTo(selector) {
    if (this._isAppendTo) return;
    this._isAppendTo = true;
    this.parent = selector;
    this.element = this.element.appendTo(selector);
    return this;
  }
}

/**
 * 這個類別提供創建和控制搜尋列的功能，包含搜尋圖示、文字輸入框和橡皮擦圖示。
 */
class SearchBar {
  /**
   * 建構一個新的 `SearchBar` 實例。@constructor
   */
  constructor() {
    this.timelines = {};
    this.handlers = {};
    /**
     * 表示搜尋列是否已附加到 DOM 中。
     * @type {boolean}
     * @private
     */
    this._isAppendTo = false;
    /**
     * 用於存儲父級 DOM 選擇器。
     * @type {string}
     * @private
     */
    this.parent = "";
    /**
     * 包含搜尋列的 jQuery 物件。
     * @type {jQuery}
     */
    this.element = this._createSearchBar();
    return this._createTimelines()._bindTimeline();
  }

  /**
   * 創建搜尋列，包含搜尋圖示、文字輸入框和橡皮擦圖示。
   * @private
   * @returns {jQuery} 整個搜尋欄。
   */
  _createSearchBar() {
    const container = $("<div>").addClass("search-bar");

    const searchIcon = createSearchIcon();
    const eraserIcon = createEraserIcon();
    const inputContainer = createTextInput({
      placeholder: "搜尋",
      class: "search",
      width: 410,
      height: 40,
    });

    container.append(searchIcon, inputContainer, eraserIcon);

    return container;
  }

  /**
   * 創建搜尋列的時間軸動畫。
   * @private
   * @returns {SearchBar} - 回傳 `SearchBar` 實例，以便進行方法鏈結。
   */
  _createTimelines() {
    const input = this.element.find("input");
    const searchIcon = this.element.find(".search-icon-container");

    this.timelines.outline = createOutlineTl(input);
    const { t1, t2 } = createSearchIconHoverTl(searchIcon);
    this.timelines.hover1 = t1;
    this.timelines.hover2 = t2;

    this.timelines.play = () => {
      this.timelines.outline.play();
      this.timelines.hover1.play();
      this.timelines.hover2.play();
    };

    this.timelines.reverse = () => {
      this.timelines.outline.reverse();
      this.timelines.hover1.reverse();
      this.timelines.hover2.reverse();
    };

    return this;
  }

  /**
   * 綁定搜尋列的時間軸動畫。
   * @private
   * @returns {SearchBar} - 回傳 `SearchBar` 實例，以便進行方法鏈結。
   */
  _bindTimeline() {
    const input = this.element.find("input");
    const eraserIcon = this.element.find(".eraser-icon-container");

    this.element.on("mouseenter", () => {
      this.timelines.play();
    });
    this.element.on("mouseleave", () => {
      if (!input.is(":focus")) this.timelines.reverse();
    });
    this.element.on("focus", "input", () => {
      this.timelines.play();
    });
    this.element.on("blur", "input", () => {
      this.timelines.reverse();
    });
    this.element.on("keyup", "input", () => {
      if (this.input) {
        eraserIcon.show(350);
        return;
      }
      eraserIcon.hide(350);
    });
    this.element.on("click", ".eraser-icon-container", () => {
      this.input = "";
    });

    return this;
  }

  /**
   * 終止所有時間軸動畫。
   * @private
   * @returns {SearchBar} - 回傳 `SearchBar` 實例，以便進行方法鏈結。
   */
  _killTimelines() {
    Object.values(this.timelines).forEach((timeline) => {
      if (timeline instanceof TimelineMax) {
        timeline.kill();
      }
    });

    this.timelines = {};
    return this;
  }

  /**
   * 顯示搜尋列。
   * @returns {SearchBar} - 回傳 `SearchBar` 實例，以便進行方法鏈結。
   */
  show() {
    if (this.element) {
      console.log("show:元素已存在");
      return this;
    }

    this.element = this._createSearchBar();
    this._createTimelines()._bindTimeline();

    if (this.handlers.input) {
      this.element.on("keyup", "input", this.handlers.input);
    }

    if (this.parent) {
      this.appendTo(this.parent);
    }

    return this;
  }

  /**
   * 隱藏搜尋列。
   * @returns {SearchBar} - 回傳 `SearchBar` 實例，以便進行方法鏈結。
   */
  hide() {
    if (!this.element) {
      console.log("hide:元素已隱藏");
      return this;
    }

    this._killTimelines();
    this.element.remove(); // remove會自動解除on事件監聽
    this.element = null;
    this._isAppendTo = false;

    return this;
  }

  /**
   * 註冊輸入事件處理程序。
   * @param {Function} handler - 輸入事件的處理程序。
   * @returns {SearchBar} - 回傳 `SearchBar` 實例，以便進行方法鏈結。
   */
  onInput(handler) {
    if (this.handlers.input) console.error("已經註冊過onInput");

    this.handlers.input = handler;

    if (!this.element) return; //若元素隱藏則等到show時會再綁定

    this.element.on("keyup", "input", () => {
      if (this.input) handler();
    });
    return this;
  }

  /**
   * 註冊清除事件處理程序。
   * @param {Function} handler - 清除事件的處理程序。
   * @returns {SearchBar} - 回傳 `SearchBar` 實例，以便進行方法鏈結。
   */
  onClear(handler) {
    if (this.handlers.clear) console.error("已經註冊過onClear");

    this.handlers.clear = handler;
    return this;
  }

  /**
   * 取得輸入框的內容。
   * @type {string}
   * @name SearchBar#input
   */
  get input() {
    if (!this.element) {
      console.log("get input: 元素隱藏中");
      return "";
    }
    return this.element.find("input").val();
  }

  /**
   * 設定輸入框的內容。
   * @param {string} value - 要設定的內容。
   * @type {string}
   * @name SearchBar#input
   */
  set input(value) {
    if (!this.element) {
      console.log("set input: 元素隱藏中，無法寫入");
      return this;
    }

    this.element.find("input").val(value);

    if (value !== "" && this.handlers.input) {
      this.handlers.input();
    } else if (this.handlers.clear) {
      this.handlers.clear();
    }

    return this;
  }

  /**
   * 附加搜尋欄到指定的 DOM 選擇器。
   * @param {string} selector - DOM 選擇器。
   * @returns {SearchBar} - 回傳 `SearchBar` 實例，以便進行方法鏈結。
   */
  appendTo(selector) {
    if (this._isAppendTo) return;
    this._isAppendTo = true;
    this.parent = selector;
    this.element = this.element.appendTo(selector);
    return this;
  }
}

/**
 * 這個類別用於創建和管理在sidebar的資料夾選單元素
 */
class FolderSelect {
  /**
   * 建構一個新的 `FolderSelect` 實例。
   * @constructor
   * @param {Object} config - 用於配置選單的物件。
   * @param {string} config.mainFolder - 選單主資料夾的名字。
   * @param {string[]} config.subFolders - 選單子資料夾的名字陣列。
   */
  constructor(config) {
    // 預設配置
    const defaultConfig = {
      mainFolder: "main",
      subFolders: ["demo1", "demo2"],
    };

    // 合併預設配置和用戶提供的配置
    config = { ...defaultConfig, ...config };

    /**
     * 表示選單是否已關閉。
     * @type {boolean}
     */
    this.isClosed = true;
    /**
     * 選單主資料夾的名字。
     * @type {string}
     */
    this.mainFolder = config.mainFolder;
    /**
     * 選單子資料夾的名字陣列。
     * @type {string[]}
     */
    this.subFolders = config.subFolders;
    /**
     * 子資料夾的數量。
     * @type {number}
     */
    this.length = config.subFolders.length;
    /**
     * 時間軸物件，用於管理動畫。
     * @type {Object}
     * @private
     */
    this._timelines = {};
    /**
     * 表示選單是否已附加到 DOM 中。
     * @type {boolean}
     * @private
     */
    this._isAppendTo = false;

    /**
     * 包含選單的 jQuery 物件。
     * @type {jQuery}
     */
    this.element = this._createFolderSelect();

    return this;
  }

  /**
   * 創建資料夾選單，包含主按鈕、水平分隔線和多個資料夾按鈕。
   * @private
   * @returns {jQuery} 資料夾選擇器的容器。
   */
  _createFolderSelect() {
    const select = $("<div>").addClass("folder-select");

    if (this.subFolders.length <= 0) {
      console.log("初始化FolderSelect錯誤：沒有子資料夾");
      return;
    }

    const main = this._createFolderButton(this.mainFolder);
    const hr = createHorizontalSeparator({ margin: 8 });
    select.append(main, hr);

    this.subFolders.forEach((folderName) => {
      this._createFolderButton(folderName).appendTo(select);
    });

    // 製作時間軸也包括初始化收起狀態
    this._timelines.open = createFolderSelectOpenTl(select);

    main.on("click", () => {
      if (this.isClosed) {
        this.open();
      } else {
        this.close();
      }
    });

    return select;
  }

  /**
   * 創建資料夾按鈕，包含多個圖層。
   * @private
   * @param {string} name - 資料夾名稱。
   * @returns {jQuery} 資料夾按鈕。
   */
  _createFolderButton(name) {
    const button = $("<button>").addClass("folder-button");

    const configs = [
      {
        separator: {
          margin: 8,
        },
        iconContainer: {},
      },
      {
        separator: {
          margin: 8,
          backgroundColor: "hsl(240, 5%, 10%)",
        },
        iconContainer: {
          imgColor: "black",
          backgroundColor: "hsl(240, 5%, 10%)",
          borderColor: "#ea81af",
        },
      },
    ];

    configs.forEach((config, index) => {
      const layer = $("<div>").addClass(`folder-button-layer${index + 1}`);
      const separator = createVerticalSeparator(config.separator);
      const iconContainer = createFolderIcon(config.iconContainer);
      const label = $("<label>").addClass("folder-button-label").text(name);
      layer.append(iconContainer, separator, label).appendTo(button);
    });

    const t1 = createFolderIconHoverTl(button.find(".folder-icon-container"));

    gsap.set(button.find(".folder-button-layer2 > *"), { y: -40 });

    const t2 = createFolderButtonHoverTl(button);
    const t3 = createFolderButtonClickTl(button);

    button.on("mouseenter", () => {
      t1.play();
      t2.play();
    });
    button.on("mouseleave", () => {
      t1.reverse();
      t2.reverse();
    });
    button.on("click", () => t3.restart());

    return button;
  }

  /**
   * 設定選單選擇事件的處理函數。
   * @param {Function} handler - 選擇事件的處理函數。
   * @returns {FolderSelect} - 回傳 `FolderSelect` 實例，以便進行方法鏈結。
   */
  onSelect(handler) {
    if (this._onSelectHandler)
      this.element.off("click", ".folder-button", this._onSelectHandler);

    this._onSelectHandler = function (e) {
      const label = $(e.target).find(".folder-button-label").text();
      handler(label);
    };

    this.element.on("click", ".folder-button", this._onSelectHandler);
    return this;
  }

  /**
   * 開啟選單。
   * @returns {FolderSelect} - 回傳 `FolderSelect` 實例，以便進行方法鏈結。
   */
  open() {
    if (!this.isClosed) return this;
    this._timelines.open.play();
    this.isClosed = false;
    return this;
  }

  /**
   * 關閉選單。
   * @returns {FolderSelect} - 回傳 `FolderSelect` 實例，以便進行方法鏈結。
   */
  close() {
    if (this.isClosed) return this;
    this._timelines.open.reverse();
    this.isClosed = true;
    return this;
  }

  /**
   * 移除選單選擇事件的處理函數。
   * @returns {FolderSelect} - 回傳 `FolderSelect` 實例，以便進行方法鏈結。
   */
  off() {
    if (this._onSelectHandler) {
      this.element.off("click", ".folder-button", this._onSelectHandler);
      this._onSelectHandler = null;
    }
    return this;
  }

  /**
   * 附加選單到指定的 DOM 選擇器。
   * @param {string} selector - DOM 選擇器。
   * @returns {FolderSelect} - 回傳 `FolderSelect` 實例，以便進行方法鏈結。
   */
  appendTo(selector) {
    if (this._isAppendTo) return;
    this._isAppendTo = true;
    this.element = this.element.appendTo(selector);
    return this;
  }
}

/**
 * 這個類別用於創建和管理在sidebar的排序選單元素
 */
class SortSelect {
  constructor() {
    this._timelines = {};
    this.isClosed = true;
    this._isAppendTo = false;
    this.element = this._createSortSelect();

    return this;
  }

  _createSortSelect() {
    const select = $("<div>").addClass("sort-select");

    const main = this._createSortButton();
    const hr = createHorizontalSeparator({ margin: 8 });
    select.append(main, hr);

    this._timelines.open = createFolderSelectOpenTl(select);

    main.on("click", () => {
      if (this.isClosed) {
        this.open();
      } else {
        this.close();
      }
    });

    return select;
  }

  _createSortButton() {
    const button = $("<button>").addClass("sort-button");
    const iconContainer = createSortIcon();
    button.append(iconContainer);

    this._bindSortButtonTimeline(button);

    return button;
  }

  _bindSortButtonTimeline(button) {
    const iconContainer = button.find(".sort-icon-container");
    const wIcon = iconContainer.children().eq(0);
    const dIcon = iconContainer.children().eq(1);

    const hoverTls = [
      ...createSortImgHoverTl(wIcon),
      ...createSortImgHoverTl(dIcon),
      createSortIconHoverTl(iconContainer),
      createSortButtonHoverTl(button),
    ];

    button.on("mouseenter", () => {
      hoverTls.forEach((tl) => {
        tl.play();
      });
    });
    button.on("mouseleave", () => {
      hoverTls.forEach((tl) => {
        tl.reverse();
      });
    });

    const clickTl = createFolderButtonClickTl(button);

    button.on("click", () => clickTl.restart());
  }

  /**
   * 開啟選單。
   * @returns {SortSelect} - 回傳 `SortSelect` 實例，以便進行方法鏈結。
   */
  open() {
    if (!this.isClosed) return this;
    this._timelines.open.play();
    this.isClosed = false;
    return this;
  }

  /**
   * 關閉選單。
   * @returns {SortSelect} - 回傳 `SortSelect` 實例，以便進行方法鏈結。
   */
  close() {
    if (this.isClosed) return this;
    this._timelines.open.reverse();
    this.isClosed = true;
    return this;
  }

  /**
   * 附加選單到指定的 DOM 選擇器。
   * @param {string} selector - DOM 選擇器。
   * @returns {SortSelect} - 回傳 `SortSelect` 實例，以便進行方法鏈結。
   */
  appendTo(selector) {
    if (this._isAppendTo) return;
    this._isAppendTo = true;
    this.element = this.element.appendTo(selector);
    return this;
  }
}

/**
 * 這個類別用於創建和管理在header的燈泡元素
 */
class HeaderBulb {
  /**
   * 建構一個新的 `HeaderBulb` 實例。
   * @constructor
   * @param {Object} config - 用於配置燈泡的物件。
   * @param {number} config.width - 燈泡的寬度。
   * @param {number} config.height - 燈泡的高度。
   * @param {number} config.intensity - 燈泡的強度。
   */
  constructor(config) {
    // 預設配置
    const defaultConfig = {
      width: 40,
      height: 40,
      intensity: 1,
    };

    // 合併預設配置和用戶提供的配置
    config = { ...defaultConfig, ...config };

    /**
     * 燈泡的寬度。
     * @type {number}
     */
    this.width = config.width;
    /**
     * 燈泡的高度。
     * @type {number}
     */
    this.height = config.height;
    /**
     * 燈泡的強度。
     * @type {number}
     */
    this.intensity = config.intensity;
    /**
     * 表示燈泡是否已附加到 DOM 中。
     * @type {boolean}
     * @private
     */
    this._isAppendTo = false;
    /**
     * 用於存儲時間軸動畫的物件。
     * @type {Object}
     * @private
     */
    this._timelines = {};
    /**
     * 顏色對應表，將顏色名稱映射到實際的顏色值。
     * @type {Object}
     * @private
     */
    this._colorMap = {
      red: "#ea81af",
      green: "#8ce197",
      yellow: "#ffff7a",
      blue: "#92e9ff",
    };

    /**
     * 包含燈泡的 jQuery 物件。
     * @type {jQuery}
     */
    this.element = this._createBulb();

    return this;
  }

  /**
   * 創建燈泡元素。
   * @private
   * @returns {jQuery} - 燈泡元素的 jQuery 物件。
   */
  _createBulb() {
    return createBulb({ width: this.width, height: this.height });
  }

  /**
   * 終止所有時間軸動畫。
   * @private
   */
  _killTimeline() {
    const tlKeys = ["red", "green", "yellow", "blue"];

    tlKeys.forEach((key) => {
      if (this._timelines[key]) {
        this._timelines[key].kill();
        this._timelines[key] = null;
      }
    });
  }

  /**
   * 切換燈泡的顏色。
   * @param {"red" | "green" | "yellow" | "blue"} color
   */
  switchLight(color) {
    this._killTimeline();
    this._timelines[color] = createBulbLightT2(this.element, {
      color: this._colorMap[color],
      intensity: this.intensity,
    }).play();
  }

  /**
   * 附加燈泡到指定的 DOM 選擇器。
   * @param {string} selector - DOM 選擇器。
   * @returns {HeaderBulb} - 回傳 `HeaderBulb` 實例，以便進行方法鏈結。
   */
  appendTo(selector) {
    if (this._isAppendTo) return;
    this._isAppendTo = true;
    this.element = this.element.appendTo(selector);
    return this;
  }
}

/**
 * 這個類別用於創建和管理具有特定特效的文件夾框元素。
 */
class FolderBoxes {
  /**
   * 建構一個新的 `FolderBox` 實例。
   * @constructor
   * @param {Object[]} configs - 用於配置文件夾框的物件。
   * @param {string} configs.bulbColor - 燈泡的顏色。
   * @param {number} configs.bulbIntensity - 燈泡的強度。
   * @param {string} configs.label - 文件夾標籤的文字。
   * @param {jQuery} configs.img - 圖片的jQuery物件
   */
  constructor(configs) {
    this.timelines = {};

    this.isShow = false;
    this._isAppendTo = false;

    this.element = this._createFolderBoxes(configs);
    this._createTimelines();
  }

  /**
   * 創建文件夾框的容器元素。
   * @private
   * @param {Object[]} configs - 用於配置文件夾框的物件。
   * @returns {jQuery} - 文件夾框容器元素的 jQuery 物件。
   */
  _createFolderBoxes(configs) {
    const container = $("<div>").addClass("folder-boxes-container");

    configs.forEach((config) => {
      const element = this._createFolderBoxContainer(config);
      this._bindTimeline(element, config).appendTo(container);
    });

    return container;
  }

  /**
   * 創建文件夾框容器元素。
   * @private
   * @param {Object} config - 用於配置文件夾框的物件。
   * @returns {jQuery} - 文件夾框容器元素的 jQuery 物件。
   */
  _createFolderBoxContainer(config) {
    const container = $("<div>").addClass("folder-box-container");

    const box = this._createFolderBox(config);
    const img = $("<img>")
      .attr("src", config.img.src)
      .addClass("folder-box-img")
      .css("width", "97.5%");
    gsap.set(img, { y: 25 });

    container.append(img, box);

    return container;
  }

  /**
   * 創建文件夾框元素。
   * @private
   * @param {Object} config - 用於配置文件夾框的物件。
   * @returns {jQuery} - 文件夾框元素的 jQuery 物件。
   */
  _createFolderBox(config) {
    const box = $("<div>").addClass("folder-box");
    const boxColor = "hsl(225, 10%, 23%)";

    const folderIcon = createFolderIcon({ borderColor: boxColor });
    const separator = createVerticalSeparator();
    const bulb = createBulb({ width: 20, height: 20 });
    const label = $("<label>").addClass("folder-box-label").text(config.label);

    box.append(folderIcon, separator, label, bulb);

    return box;
  }

  /**
   * 綁定時間軸動畫效果。
   * @private
   * @param {jQuery} boxContainer - 文件夾框容器元素的 jQuery 物件。
   * @param {Object} config - 用於配置文件夾框的物件。
   * @returns {jQuery} - 文件夾框容器元素的 jQuery 物件。
   */
  _bindTimeline(boxContainer, config) {
    const box = boxContainer.find(".folder-box");
    const bulb = boxContainer.find(".bulb-container");
    const folderIcon = boxContainer.find(".folder-icon-container");

    const t1 = createBulbLightTl(bulb, {
      color: config.bulbColor,
      intensity: config.bulbIntensity,
    });
    const t2 = createBulbLightTl(bulb, {
      color: config.bulbColor,
      intensity: config.bulbIntensity * 1.5,
      yoyo: true,
    });
    const t3 = createFolderIconHoverTl(folderIcon);
    const t4 = createFolderBoxClickTl(box);
    const t5 = createFolderBoxHoverTl(box);
    const t6 = createFolderBoxContainerHoverTl(boxContainer);

    boxContainer.on("mouseenter", ".folder-box", () => {
      t1.play();
      t3.play();
      t5.play();
      t6.play();
    });
    boxContainer.on("mouseleave", ".folder-box", () => {
      t1.reverse();
      t3.reverse();
      t5.reverse();
      t6.reverse();
    });
    boxContainer.on("click", ".folder-box", () => {
      t2.restart();
      t4.restart();
      t6.reverse();
    });

    return boxContainer;
  }

  /**
   * 創建並初始化文件夾框的時間軸效果。
   * @private
   * @returns {FolderBoxes} - 回傳 `FolderBoxes` 實例，以便進行方法鏈結。
   */
  _createTimelines() {
    this.timelines.show = gsap
      .timeline({
        defaults: { ease: "back.out(4)", duration: 0.35 },
        paused: true,
      })
      .from(this.element.children(), { scale: 0.5, stagger: 0.15 })
      .from(
        this.element.children(),
        { ease: "set1", autoAlpha: 0, stagger: 0.15 },
        "<"
      );

    return this;
  }

  /**
   * 顯示文件夾框。
   * @returns {FolderBoxes} - 回傳 `FolderBoxes` 實例，以便進行方法鏈結。
   */
  show() {
    if (this.isShow) return this;

    this.isShow = true;
    this.timelines.show.play();

    return this;
  }

  /**
   * 隱藏文件夾框。
   */
  async hide() {
    if (!this.isShow) return this;

    this.isShow = false;
    this.timelines.show.reverse();

    this.timelines.show.eventCallback("onReverseComplete", null);

    await new Promise((resolve) => {
      this.timelines.show.eventCallback("onReverseComplete", resolve);
    });

    return this;
  }

  /**
   * 設定按鈕選擇事件的處理函數。
   * @param {Function} handler - 選擇事件的處理函數。
   * @returns {FolderBoxes} - 回傳 `FolderBoxes` 實例，以便進行方法鏈結。
   */
  onSelect(handler) {
    if (this._onSelectHandler)
      this.element.off("click", ".folder-box", this._onSelectHandler);

    this._onSelectHandler = function (e) {
      const label = $(e.target).find(".folder-box-label").text();
      handler(label);
    };

    this.element.on("click", ".folder-box", this._onSelectHandler);
    return this;
  }

  /**
   * 附加文件夾框到指定的 DOM 選擇器。
   * @param {string} selector - DOM 選擇器。
   * @returns {FolderBoxes} - 回傳 `FolderBoxes` 實例，以便進行方法鏈結。
   */
  appendTo(selector) {
    if (this._isAppendTo) return;
    this._isAppendTo = true;
    this.element = this.element.appendTo(selector);
    return this;
  }
}

/**
 * 這個類別用於創建和管理圖片庫組件。
 */
class Gallery {
  /** @param {jQuery} images - 圖片元素的jQuery對象陣列。 */
  constructor(urls) {
    this.urls = urls;
    this.timelines = {};

    this.isShow = false;
    this._isAppendTo = false;
  }

  /**
   * 創建圖片庫的主要元素。
   * @private
   * @param {jQuery} images - 圖片元素的jQuery對象陣列。
   * @returns {jQuery} - 圖片庫的主要元素。
   */
  async _createGallery() {
    const gallery = $("<div>").addClass("gallery");
    const grid = $("<div>").addClass("images-grid");

    const images = await Promise.all(
      this.urls.map((url) => this._createImage(url))
    );

    grid.append(images).appendTo(gallery);

    return gallery;
  }

  /**
   * 創建單個圖片元素。
   * @private
   * @param {jQuery} image - 圖片元素的jQuery對象。
   * @returns {Promise<jQuery>} - 創建的圖片容器元素。
   */
  async _createImage(url) {
    const container = $("<div>").addClass("image-container");

    const image = $("<img>").attr("src", url).attr("decoding", "async");
    const reflexContainer = $("<div>").addClass("reflex-container");
    $("<div>").addClass("reflex-plane").appendTo(reflexContainer);

    container.append(reflexContainer, image);

    async function decode(image) {
      try {
        await image.decode();
      } catch (error) {
        await decode(image);
      }
    }

    await decode(image[0]);

    this._bindTimeline(container);

    return container;
  }

  /**
   * 綁定圖片元素的時間軸。
   * @private
   * @param {jQuery} imageContainer - 圖片容器的jQuery對象。
   */
  _bindTimeline(imageContainer) {
    const image = imageContainer.find("img");
    const element = image.add(imageContainer.find(".reflex-plane"));
    const t1 = createImageHoverTl(imageContainer);
    const t2 = createImageClickTl(imageContainer);
    const mousemoveHandler = this._createMousemoveHandler(element);

    image.on("mouseenter", () => {
      t1.play();

      image.on("mousemove", mousemoveHandler);
    });
    image.on("mouseleave", () => {
      t1.reverse();

      image.off("mousemove", mousemoveHandler);

      gsap.to(element, {
        overwrite: "auto",
        ease: "set1",
        duration: 0.5,
        rotateX: 0,
        rotateY: 0,
      });
    });
    image.on("click", () => t2.restart());
  }

  /**
   * 創建滑鼠移動事件處理器。
   * @private
   * @param {jQuery} element - 被處理的元素。
   * @returns {Function} - 滑鼠移動事件處理器函式。
   */
  _createMousemoveHandler(element) {
    return (e) => {
      const centerX = element.offset().left + element.width() / 2;
      const centerY = element.offset().top + element.height() / 2;
      const offsetX = e.pageX - centerX;
      const offsetY = e.pageY - centerY;

      gsap.to(element, {
        overwrite: "auto",
        ease: "back.out(10)",
        duration: 0.5,
        rotateX: -offsetY / 7,
        rotateY: offsetX / 15,
      });
    };
  }

  /**
   * 創建並初始化圖片庫的時間軸效果。
   * @private
   * @returns {Gallery} - 回傳 `Gallery` 實例，以便進行方法鏈結。
   */
  _createTimelines() {
    this.timelines.show = gsap
      .timeline({ defaults: { ease: "set1" }, paused: true })
      .from(this.element, { autoAlpha: 0, duration: 0.2 });

    return this;
  }

  /**
   * 顯示圖片庫。
   */
  async show() {
    if (this.isShow) return this;

    this.element = await this._createGallery();
    this._createTimelines().appendTo("#content");

    this.isShow = true;
    this.timelines.show.play();

    return this;
  }

  /**
   * 隱藏圖片庫。
   */
  async hide() {
    if (!this.isShow) return this;

    this.isShow = false;
    this.timelines.show.reverse();

    this.timelines.show.eventCallback("onReverseComplete", null);

    await new Promise((resolve) => {
      this.timelines.show.eventCallback("onReverseComplete", resolve);
    });
    this.element.remove();
    this.element = null;
    this._isAppendTo = false;

    return this;
  }

  /**
   * 切換圖片庫的顯示/隱藏狀態。
   * @param {boolean} e - 顯示為 `true`，隱藏為 `false`。
   */
  async toggle(e) {
    return e ? await this.show() : await this.hide();
  }

  /**
   * 附加實例元素到指定的 DOM 選擇器。
   * @param {string} selector - DOM 選擇器。
   * @returns {Gallery} - 回傳 `Gallery` 實例，以便進行方法鏈結。
   */
  appendTo(selector) {
    if (this._isAppendTo) return;
    this._isAppendTo = true;
    this.element = this.element.appendTo(selector);
    return this;
  }
}
