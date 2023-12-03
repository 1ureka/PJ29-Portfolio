/**
 * 組件的預設空白類
 */
class component {
  constructor() {
    this._isAppendTo = false;
  }

  /**
   * 附加實例元素到指定的 DOM 選擇器。
   * @param {string} selector - DOM 選擇器。
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
 * 這個類別提供創建和控制上下滾動按鈕的功能。
 */
class ScrollButtons extends component {
  /**
   * 建構一個新的 `ScrollButtons` 實例。@constructor
   */
  constructor() {
    super();
    this._timelines = {};
    this._handlers = {};

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
    const icon = new ScrollIcon();
    if (type === "down") gsap.set(icon.element, { rotate: 180 });

    button.append(icon.element);

    const hoverTls = [
      ...icon.timeline,
      createBackgroundColorTl(button, "#ea81af"),
    ];

    const clickTl = createScaleYoyoTl(button, 0.6);

    this._bindTimeline(button, hoverTls, clickTl);

    return button;
  }

  /**
   * 將時間軸綁定到按鈕的不同事件。
   * @param {jQuery} button - 要綁定的按鈕元素。
   * @param {TimelineMax[]} hover - 滑鼠進入時觸發的時間軸陣列。
   * @param {TimelineMax} click - 按鈕點擊時觸發的時間軸。
   */
  _bindTimeline(button, hover, click) {
    button.on("mouseenter", () => {
      hover.forEach((tl) => {
        tl.play();
      });
    });
    button.on("mouseleave", () => {
      hover.forEach((tl) => {
        tl.reverse();
      });
    });

    button.on("click", () => click.restart());
  }

  /**
   * 創建並初始化上滾動按鈕的時間軸效果。
   * @private
   * @returns {ScrollButtons} - 回傳 `ScrollButtons` 實例，以便進行方法鏈結。
   */
  _createTimelines() {
    this._timelines.show = gsap
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
   * 將滾動元素設定為指定的 jQuery 元素，同時設定上滾動和下滾動按鈕的點擊事件處理程序。
   * @param {jQuery} element - 欲添加滾動按鈕的 jQuery 元素。
   */
  set scrollElement(element) {
    /** @type {HTMLElement} */
    this._scrollElement = element[0];

    if (this._handlers.up) this.element.off("click", ".up", this._handlers.up);

    this._handlers.up = () => this._up();
    this.element.on("click", ".up", this._handlers.up);

    if (this._handlers.down)
      this.element.off("click", ".down", this._handlers.down);

    this._handlers.down = () => this._down();
    this.element.on("click", ".down", this._handlers.down);
  }

  /**
   * 捲動至頂部的方法。
   * @private
   */
  _up() {
    if (this._scrollElement)
      this._scrollElement.scrollTo({ top: 0, behavior: "smooth" });

    return this;
  }

  /**
   * 捲動至底部的方法。
   * @private
   */
  _down() {
    if (this._scrollElement)
      this._scrollElement.scrollTo({
        top: this._scrollElement.scrollHeight,
        behavior: "smooth",
      });

    return this;
  }

  /**
   * 解除所有事件處理程序的註冊。
   * @returns {ScrollButtons} - 回傳 `ScrollButtons` 實例，以便進行方法鏈結。
   */
  off() {
    this.element.off("click", ".up", this._handlers.up);
    this._handlers.up = null;
    this.element.off("click", ".down", this._handlers.down);
    this._handlers.down = null;

    return this;
  }

  /**
   * 顯示上滾動按鈕。
   */
  show() {
    if (this.isShow) return this;

    this.isShow = true;
    this._timelines.show.play();

    return this;
  }

  /**
   * 隱藏上滾動按鈕。
   */
  async hide() {
    if (!this.isShow) return this;

    this.isShow = false;
    this._timelines.show.reverse();

    this._timelines.show.eventCallback("onReverseComplete", null);

    await new Promise((resolve) => {
      this._timelines.show.eventCallback("onReverseComplete", resolve);
    });

    return this;
  }
}

/**
 * 這個類別提供創建和控制搜尋列的功能，包含搜尋圖示、文字輸入框和橡皮擦圖示。
 */
class SearchBar extends component {
  /**
   * 建構一個新的 `SearchBar` 實例。@constructor
   */
  constructor() {
    super();
    this._timelines = {};
    this._handlers = {};
    this.isShow = true;

    /** 包含搜尋列的 jQuery 物件。 @type {jQuery} */
    this.element = this._createSearchBar();
    this._createTimelines();
  }

  /**
   * 創建搜尋列，包含搜尋圖示、文字輸入框和橡皮擦圖示。
   * @private
   * @returns {jQuery} 整個搜尋欄。
   */
  _createSearchBar() {
    const container = $("<div>").addClass("search-bar");

    const searchIcon = new SearchIcon();
    const eraserIcon = new EraserIcon();

    const inputContainer = $("<div>")
      .css({ width: 410, height: 40 })
      .addClass("text-input-container");
    const input = $("<input>")
      .attr("type", "text")
      .attr("placeholder", "搜尋")
      .css({ width: 410, height: 40 })
      .addClass("text-input")
      .appendTo(inputContainer);

    container.append(searchIcon.element, inputContainer, eraserIcon.element);

    const hoverTls = [createOutlineTl(input), ...searchIcon.timeline];

    this._bindTimeline(container, hoverTls);
    this._bindEvents(container, eraserIcon.element);

    return container;
  }

  /**
   * 綁定搜尋列的時間軸動畫。
   * @private
   */
  _bindTimeline(container, hover) {
    const input = container.find("input");

    container.on("mouseenter", () => {
      hover.forEach((tl) => {
        tl.play();
      });
    });
    container.on("mouseleave", () => {
      hover.forEach((tl) => {
        if (!input.is(":focus")) tl.reverse();
      });
    });
    container.on("focus", "input", () => {
      hover.forEach((tl) => {
        tl.play();
      });
    });
    container.on("blur", "input", () => {
      hover.forEach((tl) => {
        tl.reverse();
      });
    });
  }

  /**
   * 綁定搜尋列的邏輯事件。
   * @private
   */
  _bindEvents(container, eraser) {
    container.on("click", ".eraser-icon-container", () => {
      this.input = "";
    });
    container.on("keyup", "input", () => {
      if (this.input) {
        eraser.show(350);
        return;
      }
      eraser.hide(350);
    });
  }

  /**
   * 創建搜尋列的時間軸動畫。
   * @private
   * @returns {SearchBar} - 回傳 `SearchBar` 實例，以便進行方法鏈結。
   */
  _createTimelines() {
    this._timelines.hide = gsap
      .timeline({ defaults: { ease: "set1" }, paused: true })
      .to(this.element, { autoAlpha: 0, y: -100 });

    return this;
  }

  /**
   * 顯示搜尋列。
   */
  show() {
    if (this.isShow) return this;

    this.isShow = true;
    this._timelines.hide.reverse();

    return this;
  }

  /**
   * 隱藏搜尋列。
   */
  async hide() {
    if (!this.isShow) return this;

    this.isShow = false;
    this._timelines.hide.play();

    this._timelines.hide.eventCallback("onComplete", null);

    await new Promise((resolve) => {
      this._timelines.hide.eventCallback("onComplete", resolve);
    });

    return this;
  }

  /**
   * 註冊輸入事件處理程序。
   * @param {Function} handler - 輸入事件的處理程序。
   * @returns {SearchBar} - 回傳 `SearchBar` 實例，以便進行方法鏈結。
   */
  onInput(handler) {
    if (this._handlers.input) console.error("已經註冊過onInput");

    this._handlers.input = () => {
      if (this.input) handler();
    };

    this.element.on("keyup", "input", this._handlers.input);

    return this;
  }

  /**
   * 註冊清除事件處理程序。
   * @param {Function} handler - 清除事件的處理程序。
   * @returns {SearchBar} - 回傳 `SearchBar` 實例，以便進行方法鏈結。
   */
  onClear(handler) {
    if (this._handlers.clear) console.error("已經註冊過onClear");

    this._handlers.clear = handler;

    this.element.on("keyup", "input", () => {
      if (!this.input) this._handlers.clear();
    });

    return this;
  }

  /**
   * 取得輸入框的內容。
   * @type {string}
   * @name SearchBar#input
   */
  get input() {
    return this.element.find("input").val();
  }

  /**
   * 設定輸入框的內容。
   * @param {string} value - 要設定的內容。
   * @type {string}
   * @name SearchBar#input
   */
  set input(value) {
    this.element.find("input").val(value);

    if (value !== "" && this._handlers.input) {
      this._handlers.input();
    } else if (this._handlers.clear) {
      this._handlers.clear();
    }

    return this;
  }
}

/**
 * 這個類別用於創建和管理在sidebar的資料夾選單元素
 */
class FolderSelect extends component {
  /**
   * 建構一個新的 `FolderSelect` 實例。
   * @constructor
   * @param {Object[]} configs - 用於配置選單的物件。
   */
  constructor(configs) {
    super();

    /** 表示選單是否已關閉。  */
    this.isClosed = true;

    this._timelines = {};
    this.isShow = true;

    /** 包含選單的 jQuery 物件。 @type {jQuery} */
    this.element = this._createFolderSelect(configs);
    this._createTimelines();
  }

  /**
   * 創建資料夾選單，包含主按鈕、水平分隔線和多個資料夾按鈕。
   * @private
   * @returns {jQuery} 資料夾選擇器的容器。
   */
  _createFolderSelect(configs) {
    const select = $("<div>").addClass("folder-select");

    if (configs.length < 1) {
      console.log("初始化FolderSelect錯誤：沒有資料夾");
      return;
    }

    const main = this._createFolderButton(
      configs[0].label,
      configs[0].category
    );
    const hr = new HorizontalSeparator({ margin: 8 });
    select.append(main, hr.element);

    configs.slice(1).forEach((config) => {
      this._createFolderButton(config.label, config.category).appendTo(select);
    });

    // 製作時間軸也包括初始化收起狀態
    this._timelines.open = createSelectOpenTl(select);

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
  _createFolderButton(name, category) {
    const icons = new FolderIcon("hsl(240, 5%, 10%)");

    const button = $("<button>")
      .addClass("folder-button")
      .data("category", category);

    const configs = [
      { separator: { margin: 8 } },
      { separator: { margin: 8, backgroundColor: "hsl(240, 5%, 10%)" } },
    ];

    configs.forEach((config, index) => {
      const layer = $("<div>").addClass(`folder-button-layer${index + 1}`);
      const vs = new VerticalSeparator(config.separator);
      const label = $("<label>").addClass("folder-button-label").text(name);

      layer.append(icons.element[index], vs.element, label).appendTo(button);
    });

    const hoverTls = [createFolderButtonHoverTl(button), ...icons.timeline];

    const clickTl = createScaleYoyoTl(button, 0.9);

    this._bindTimeline(button, hoverTls, clickTl);

    return button;
  }

  /**
   * 將時間軸綁定到按鈕的不同事件。
   * @param {jQuery} button - 要綁定的按鈕元素。
   * @param {TimelineMax[]} hover - 滑鼠進入時觸發的時間軸陣列。
   * @param {TimelineMax} click - 按鈕點擊時觸發的時間軸。
   */
  _bindTimeline(button, hover, click) {
    button.on("mouseenter", () => {
      hover.forEach((tl) => {
        tl.play();
      });
    });
    button.on("mouseleave", () => {
      hover.forEach((tl) => {
        tl.reverse();
      });
    });
    button.on("click", () => click.restart());
  }

  /**
   * 創建並初始化選單的時間軸效果。
   * @private
   * @returns {FolderSelect} - 回傳 `FolderSelect` 實例，以便進行方法鏈結。
   */
  _createTimelines() {
    this._timelines.hide = gsap
      .timeline({ defaults: { ease: "set1" }, paused: true })
      .to(this.element, { autoAlpha: 0, x: -100 });

    return this;
  }

  /**
   * 顯示選單。
   */
  show() {
    if (this.isShow) return this;

    this.isShow = true;
    this._timelines.hide.reverse();

    return this;
  }

  /**
   * 隱藏選單。
   */
  async hide() {
    if (!this.isShow) return this;

    this.isShow = false;
    this._timelines.hide.play();

    this._timelines.hide.eventCallback("onComplete", null);

    await new Promise((resolve) => {
      this._timelines.hide.eventCallback("onComplete", resolve);
    });

    return this;
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
      const category = $(e.target).data("category");
      handler(category);
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
   * 暫時移除選單選擇事件的處理函數。
   * @returns {FolderSelect} - 回傳 `FolderSelect` 實例，以便進行方法鏈結。
   */
  off() {
    if (this._onSelectHandler) {
      this.element.off("click", ".folder-button", this._onSelectHandler);
    }
    return this;
  }

  /**
   * 重新註冊選單選擇事件的處理函數。
   * @returns {FolderSelect} - 回傳 `FolderSelect` 實例，以便進行方法鏈結。
   */
  on() {
    if (this._onSelectHandler) {
      this.element.on("click", ".folder-button", this._onSelectHandler);
    }
    return this;
  }
}

/**
 * 這個類別用於創建和管理在sidebar的排序選單元素
 */
class SortSelect extends component {
  constructor() {
    super();

    this._timelines = {};
    this.isClosed = true;
    this.isShow = true;

    this.icons = {
      name: new NameIcon(),
      date: new DateIcon(),
      size: new SizeIcon(),
    };
    this.element = this._createSortSelect();
    this._createTimelines();
  }

  /**
   * 創建排序選單的元素。
   * @private @returns {jQuery} 排序選單的元素。
   */
  _createSortSelect() {
    const select = $("<div>").addClass("sort-select");

    const main = this._createMainButton();
    const hr = new HorizontalSeparator({ margin: 8 });
    const toggler = this._createReverseToggler();

    select.append(main, hr.element, toggler);

    const options = [
      this._createOptionButton("name", "依名稱排序"),
      this._createOptionButton("date", "依日期排序"),
      this._createOptionButton("size", "依大小排序"),
    ];
    options.forEach((button) => select.append(button));

    this._timelines.open = createSelectOpenTl(select);

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
   * 創建主按鈕，包含排序圖示，並綁定相應的動畫效果。
   * @private @returns {jQuery} 主按鈕的容器。
   */
  _createMainButton() {
    const button = $("<button>").addClass("sort-button");

    const icons = new SortIcon();

    icons.element.forEach((icon) => {
      icon.appendTo(button);
    });

    const hoverTls = [
      ...icons.timeline,
      createScaleTl(button, 1, 1.05),
      createBackgroundColorTl(button, "#ea81af"),
      createTranslateTl(button, 0, -5),
      createZIndexTl(button, 5, 6),
    ];

    const clickTl = createScaleYoyoTl(button, 0.8);

    this._bindTimeline(button, hoverTls, clickTl);

    return button;
  }

  /**
   * 創建反轉按鈕，包含標籤和切換器，並綁定相應的動畫效果。
   * @private @returns {jQuery} 反轉按鈕的容器。
   */
  _createReverseToggler() {
    const container = $("<button>")
      .addClass("reverse-container")
      .css("cursor", "default");

    const label = $("<label>").addClass("sort-button-label").text("反轉排序");
    const toggler = new ToggleButton();
    gsap.set(toggler.element, { scale: 0.8 });

    container.append(label, toggler.element);

    return container;
  }

  /**
   * 創建選項按鈕，包含指定類型的圖示和標籤，並綁定相應的動畫效果。
   * @private
   * @param {string} type - 圖示的類型。
   * @param {string} name - 按鈕的標籤名稱。
   * @returns {jQuery} 選項按鈕的容器。
   */
  _createOptionButton(type, name) {
    const icons = this.icons[type];

    const button = $("<button>").addClass("sort-button");

    const configs = [
      { separator: { margin: 8 } },
      { separator: { margin: 8, backgroundColor: "hsl(240, 5%, 10%)" } },
    ];

    configs.forEach((config, index) => {
      const layer = $("<div>").addClass(`sort-button-layer${index + 1}`);
      const vs = new VerticalSeparator(config.separator);
      const label = $("<label>").addClass("sort-button-label").text(name);

      layer.append(icons.element[index], vs.element, label).appendTo(button);
    });

    const hoverTls = [createSortButtonHoverTl(button), ...icons.timeline];

    const clickTl = createScaleYoyoTl(button, 0.9);

    this._bindTimeline(button, hoverTls, clickTl);

    return button;
  }

  /**
   * 綁定按鈕的動畫效果。
   * @private
   * @param {jQuery} button - 要綁定動畫的按鈕。
   * @param {TimelineMax[]} hover - 進入時的動畫效果。
   * @param {TimelineMax} click - 點擊時的動畫效果。
   */
  _bindTimeline(button, hover, click) {
    button.on("mouseenter", () => {
      hover.forEach((tl) => {
        tl.play();
      });
    });
    button.on("mouseleave", () => {
      hover.forEach((tl) => {
        tl.reverse();
      });
    });
    button.on("click", () => click.restart());
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
   * 創建並初始化選單的時間軸效果。
   * @private
   * @returns {FolderSelect} - 回傳 `FolderSelect` 實例，以便進行方法鏈結。
   */
  _createTimelines() {
    this._timelines.hide = gsap
      .timeline({ defaults: { ease: "set1" }, paused: true })
      .to(this.element, { autoAlpha: 0, x: -100 });

    return this;
  }

  /**
   * 顯示選單。
   */
  show() {
    if (this.isShow) return this;

    this.isShow = true;
    this._timelines.hide.reverse();

    return this;
  }

  /**
   * 隱藏選單。
   */
  async hide() {
    if (!this.isShow) return this;

    this.isShow = false;
    this._timelines.hide.play();

    this._timelines.hide.eventCallback("onComplete", null);

    await new Promise((resolve) => {
      this._timelines.hide.eventCallback("onComplete", resolve);
    });

    return this;
  }
}

/**
 * 這個類別用於創建和管理sidebar的設定選單元素
 */
class SettingSelect extends component {
  constructor() {
    super();

    this._timelines = {};
    this.element = this._createMainButton().add(this._createSelect());
    this._createTimelines();

    this.isShow = true;
  }

  _createSelect() {
    const container = $("<div>").addClass("setting-select");

    return container;
  }

  _createMainButton() {
    const button = $("<button>").addClass("setting-button");

    const hoverTls = [
      createScaleTl(button, 1, 1.05),
      createBackgroundColorTl(button, "#ea81af"),
      createTranslateTl(button, 0, -5),
      createZIndexTl(button, 5, 6),
    ];

    const clickTl = createScaleYoyoTl(button, 0.8);

    this._bindTimeline(button, hoverTls, clickTl);

    return button;
  }

  /**
   * 綁定按鈕的時間軸效果。
   */
  _bindTimeline(button, hover, click) {
    button.on("mouseenter", () => {
      hover.forEach((tl) => {
        tl.play();
      });
    });
    button.on("mouseleave", () => {
      hover.forEach((tl) => {
        tl.reverse();
      });
    });
    button.on("click", () => click.restart());
  }

  /**
   * 創建並初始化選單的時間軸效果。
   * @private
   * @returns {FolderSelect} - 回傳 `FolderSelect` 實例，以便進行方法鏈結。
   */
  _createTimelines() {
    this._timelines.hide = gsap
      .timeline({ defaults: { ease: "set1" }, paused: true })
      .to(this.element, { autoAlpha: 0, x: -100 });

    return this;
  }

  /**
   * 顯示選單。
   */
  show() {
    if (this.isShow) return this;

    this.isShow = true;
    this._timelines.hide.reverse();

    return this;
  }

  /**
   * 隱藏選單。
   */
  async hide() {
    if (!this.isShow) return this;

    this.isShow = false;
    this._timelines.hide.play();

    this._timelines.hide.eventCallback("onComplete", null);

    await new Promise((resolve) => {
      this._timelines.hide.eventCallback("onComplete", resolve);
    });

    return this;
  }
}

/**
 * 這個類別用於創建和管理在header的燈泡元素
 */
class HeaderBulb extends component {
  /**
   * 建構一個新的 `HeaderBulb` 實例。
   * @constructor @param {Object} colorMap - 用於配置圖片牆與燈泡顏色對應關係的映射表。
   */
  constructor(colorMap) {
    super();

    /** 燈泡目前的色彩。 @type {string | "off"} */
    this.currentColor = "off";

    this._timelines = {};
    this._colorMap = colorMap;

    /** 包含燈泡的 jQuery 物件。 @type {jQuery} */
    this.element = this._createBulb();
  }

  /**
   * 創建燈泡元素。
   * @private
   * @returns {jQuery} - 燈泡元素的 jQuery 物件。
   */
  _createBulb() {
    this.bulb = new Bulb(30, 30);

    return this.bulb.element;
  }

  /**
   * 終止所有時間軸動畫。
   * @private
   */
  _killTimeline() {
    const tlKeys = Object.values(this._colorMap);

    tlKeys.forEach((color) => {
      if (this._timelines[color]) {
        this._timelines[color].kill();
        this._timelines[color] = null;
      }
    });
  }

  /**
   * 切換燈泡的顏色。
   * @param {string} gallery
   */
  switchLight(gallery) {
    this.currentColor = this._colorMap[gallery];

    this.flickerLight();

    return this;
  }

  /**
   * 使燈泡的顏色閃爍。
   */
  flickerLight() {
    this._killTimeline();
    this._timelines[this.currentColor] = this.bulb
      .createTimeline(this.currentColor)
      .play();

    return this;
  }
}

/**
 * 這個類別用於創建和管理具有特定特效的文件夾框元素。
 */
class FolderBoxes extends component {
  /**
   * 建構一個新的 `FolderBox` 實例。
   * @constructor
   * @param {Object[]} configs - 用於配置文件夾框的物件。
   */
  constructor(configs) {
    super();

    this._timelines = {};

    this.isShow = false;

    this.element = this._createFolderBoxes(configs);
    this._createTimelines();
  }

  /**
   * 創建文件夾框的容器元素。
   * @private
   * @returns {jQuery} - 文件夾框容器元素的 jQuery 物件。
   */
  _createFolderBoxes(configs) {
    const container = $("<div>").addClass("folder-boxes-container");

    configs.forEach((config) =>
      this._createFolderBox(config).appendTo(container)
    );

    return container;
  }

  /**
   * 創建文件夾框元素。
   * @private
   * @returns {jQuery} - 文件夾框元素的 jQuery 物件。
   */
  _createFolderBox(config) {
    const container = $("<div>").addClass("folder-box-container");

    const box = $("<div>")
      .addClass("folder-box")
      .data("category", config.category);

    const folderIcon = new FolderIcon("hsl(225, 10%, 23%)");
    const vs = new VerticalSeparator();
    const bulb = new Bulb(20, 20);
    const label = $("<label>").addClass("folder-box-label").text(config.label);

    box.append(folderIcon.element[0], vs.element, label, bulb.element);

    const img = $("<img>")
      .attr("src", config.img.src)
      .addClass("folder-box-img")
      .css("width", "97.5%");
    gsap.set(img, { y: 25 });

    container.append(img, box);

    const boxTl = this._createFolderBoxTl(box, img);
    const bulbTl = bulb.createTimeline(config.bulbColor, config.bulbIntensity);

    const hoverTls = [
      folderIcon.timeline[0],
      bulbTl,
      boxTl.minWidthTl,
      boxTl.openTl,
    ];

    const clickTl = createScaleYoyoTl(box, 0.9);

    this._bindTimeline(container, hoverTls, clickTl, boxTl.openTl);

    return container;
  }

  /**
   * 製作box的時間軸動畫效果。
   * @private
   */
  _createFolderBoxTl(box, img) {
    const minWidthTl = gsap
      .timeline({
        defaults: { duration: 0.2, ease: "set1" },
        paused: true,
      })
      .fromTo(box, { minWidth: "100%" }, { minWidth: "105%" });

    const openTl = gsap
      .timeline({
        defaults: { duration: 0.2, ease: "set1" },
        paused: true,
      })
      .from(img, {
        y: 0,
        autoAlpha: 0,
      });

    return { minWidthTl, openTl };
  }

  /**
   * 綁定時間軸動畫效果。
   * @private
   */
  _bindTimeline(element, hover, click, click2) {
    element.on("mouseenter", () => {
      hover.forEach((tl) => {
        tl.play();
      });
    });
    element.on("mouseleave", () => {
      hover.forEach((tl) => {
        tl.reverse();
      });
    });
    element.on("click", () => {
      click.restart();
      click2.reverse();
    });
  }

  /**
   * 創建並初始化文件夾框的時間軸效果。
   * @private
   * @returns {FolderBoxes} - 回傳 `FolderBoxes` 實例，以便進行方法鏈結。
   */
  _createTimelines() {
    this._timelines.show = gsap
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
    this._timelines.show.play();

    return this;
  }

  /**
   * 隱藏文件夾框。
   */
  async hide() {
    if (!this.isShow) return this;

    this.isShow = false;
    this._timelines.show.reverse();

    this._timelines.show.eventCallback("onReverseComplete", null);

    await new Promise((resolve) => {
      this._timelines.show.eventCallback("onReverseComplete", resolve);
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
      const category = $(e.target).data("category");
      handler(category);
    };

    this.element.on("click", ".folder-box", this._onSelectHandler);
    return this;
  }
}

/**
 * 這個類別用於創建和管理圖片庫組件。
 */
class Gallery extends component {
  /** @param {string[]} urls - 圖片的 URL 陣列。 */
  constructor(urls) {
    super();
    /** @type {string[]} */
    this.urls = urls;
    this.timelines = {};

    this.isShow = false;
    this._isRegisterOnSelect = false;
  }

  /**
   * 創建圖片庫的主要元素。
   * @private
   * @returns {Promise<jQuery>} - 圖片庫的主要元素。
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
   * @param {string} url - 圖片的 URL。
   * @returns {Promise<jQuery>} - 創建的圖片容器元素。
   */
  async _createImage(url) {
    const container = $("<div>").addClass("image-container");

    const image = $("<img>").attr("src", url).attr("decoding", "async");
    const reflexContainer = $("<div>").addClass("reflex-container");
    $("<div>").addClass("reflex-plane").appendTo(reflexContainer);

    container.append(reflexContainer, image);

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
    const t2 = createScaleYoyoTl(imageContainer, 0.9);
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
    const images = this.element.children().children();
    this.timelines.show = gsap
      .timeline({ defaults: { ease: "set1" }, paused: true })
      .from(this.element, { autoAlpha: 0, duration: 0.05 })
      .from(
        images,
        {
          autoAlpha: 0,
          scale: 0.5,
          ease: "back.out(2)",
          stagger: { from: "random", amount: 0.35 },
        },
        "<"
      );

    return this;
  }

  /**
   * 顯示圖片庫。
   * @returns {Promise<Gallery>} - 回傳 `Gallery` 實例，以便進行方法鏈結。
   */
  async show() {
    if (this.isShow) return this;

    this.element = await this._createGallery();
    this._createTimelines().appendTo("#content");
    this.element.on("click", "img", this._onSelectHandler);
    await delay(100);

    this.isShow = true;
    this.timelines.show.play();

    return this;
  }

  /**
   * 隱藏圖片庫。
   * @returns {Promise<Gallery>} - 回傳 `Gallery` 實例，以便進行方法鏈結。
   */
  async hide() {
    if (!this.isShow) return this;

    this.isShow = false;
    this.element.find(".image-container").off();
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
   * @returns {Promise<Gallery>} - 回傳 `Gallery` 實例，以便進行方法鏈結。
   */
  async toggle(e) {
    return e ? await this.show() : await this.hide();
  }

  /**
   * 設定圖片庫選擇事件的處理函數。
   * @param {Function} handler - 選擇事件的處理函數。
   * @returns {Gallery} - 回傳 `Gallery` 實例，以便進行方法鏈結。
   */
  onSelect(handler) {
    if (this._isRegisterOnSelect && this.element)
      this.element.off("click", "img", this._onSelectHandler);

    this._isRegisterOnSelect = true;
    this._onSelectHandler = function () {
      handler($(this));
    };

    return this;
  }
}

/**
 * 這個類別用於創建和管理預覽圖片組件。
 */
class PreviewImage extends component {
  constructor() {
    super();

    this.category = "";
    this.url = "";
    this._timelines = {};

    this.element = this._createImageContainer();
    this._createTimelines();
  }

  /**
   * 創建包含圖片的容器元素。
   * @private @returns {jQuery} - 圖片容器元素的 jQuery 物件。
   */
  _createImageContainer() {
    const container = $("<div>").addClass("preview-container");
    const image = $("<img>").attr("src", "").attr("decoding", "async");

    image.appendTo(container);

    return container;
  }

  /**
   * 創建時間軸效果。
   * @private
   */
  _createTimelines() {
    const image = this.element.children();
    this._timelines.show = gsap
      .timeline({ defaults: { ease: "set1", duration: 0.35 }, paused: true })
      .from(this.element, { autoAlpha: 0, duration: 0.05 })
      .from(image, {
        autoAlpha: 0,
        scale: 0.5,
        y: -100,
        ease: "back.out(2)",
      });
  }

  /**
   * 顯示預覽圖片。
   * @param {string} url - 圖片的 URL。
   * @param {string} category - 圖片的類別。
   * @returns {PreviewImage} - 回傳 `PreviewImage` 實例，以便進行方法鏈結。
   */
  show(url, category) {
    this.url = url;
    this.category = category;
    this.element.find("img").attr("src", url);

    this._timelines.show.restart();

    return this;
  }

  /**
   * 隱藏預覽圖片。
   * @async
   * @returns {Promise<PreviewImage>} - 回傳一個 Promise，當隱藏動畫完成後解析。
   */
  async hide() {
    this._timelines.show.reverse();

    this._timelines.show.eventCallback("onReverseComplete", null);

    await new Promise((resolve) => {
      this._timelines.show.eventCallback("onReverseComplete", resolve);
    });

    return this;
  }
}

/**
 * 這個類別用於創建和管理預覽選單組件。
 */
class PreviewButtons extends component {
  constructor() {
    super();

    this._timelines = {};
    this.url = "";
    this._onSelectHandler = null;

    this.isShow = false;

    this.element = this._createPreviewButtons();
    this._createTimelines();
  }

  /**
   * 創建包含預覽按鈕的容器元素。
   * @private @returns {jQuery} - 預覽按鈕容器元素的 jQuery 物件。
   */
  _createPreviewButtons() {
    const container = $("<div>").addClass("preview-buttons-container");

    const button1 = this._createReturnButton();
    const button2 = this._createFullscreenButton();

    container.append(button1, button2);

    return container;
  }

  /**
   * 創建返回按鈕元素。
   * @private @returns {jQuery} - 返回按鈕元素的 jQuery 物件。
   */
  _createReturnButton() {
    const button = $("<button>").addClass("return-button");

    const iconContainer = $("<div>").addClass("return-icon-container");

    const makeImg = () => {
      return $("<img>")
        .attr("src", "images/icons/return.png")
        .addClass("return-img")
        .appendTo(iconContainer);
    };
    const makeGif = () => {
      const timestamp = $.now();
      return $("<img>")
        .attr("src", `images/icons/return.gif?timestamp=${timestamp}`)
        .addClass("return-gif")
        .appendTo(iconContainer);
    };

    button.append(iconContainer);
    makeImg();

    button.on("mouseenter", () => {
      const imgs = button.find(".return-img");
      imgs.remove();
      makeGif().show();
    });
    button.on("mouseleave", () => {
      const gifs = button.find(".return-gif");
      gifs.hide(500, () => gifs.remove());
      makeImg().hide().show(500);
    });

    this._bindTimeline(button);

    return button;
  }

  /**
   * 創建全螢幕按鈕元素。
   * @private @returns {jQuery} - 全螢幕按鈕元素的 jQuery 物件。
   */
  _createFullscreenButton() {
    const button = $("<button>").addClass("fullscreen-button");

    const icon = new FullscreenIcon();

    button.append(icon.element);

    button.on("mouseenter", () => icon.timeline.play());
    button.on("mouseleave", () => icon.timeline.reverse());

    this._bindTimeline(button);

    return button;
  }

  /**
   * 綁定按鈕的時間軸效果。
   * @private @param {jQuery} button - 按鈕元素的 jQuery 物件。
   */
  _bindTimeline(button) {
    const hoverT1 = createScaleTl(button, 1, 1.1);
    const hoverT2 = createBackgroundColorTl(button, "#ea81af");
    const clickTl = createScaleYoyoTl(button, 0.75);

    const hoverPlay = () => {
      hoverT1.play();
      hoverT2.play();
    };
    const hoverReverse = () => {
      hoverT1.reverse();
      hoverT2.reverse();
    };

    button.on("mouseenter", hoverPlay);
    button.on("mouseleave", hoverReverse);
    button.on("click", () => clickTl.restart());
  }

  /**
   * 創建並初始化按鈕的時間軸效果。
   * @private
   */
  _createTimelines() {
    this._timelines.show = gsap
      .timeline({ defaults: { ease: "set1" }, paused: true })
      .from(this.element, { autoAlpha: 0, duration: 0.05 })
      .from(this.element.children(), {
        autoAlpha: 0,
        scale: 0.5,
        ease: "back.out(4)",
        stagger: 0.1,
      });

    return this;
  }

  /**
   * 顯示預覽按鈕。
   */
  show() {
    if (this.isShow) return this;

    this.isShow = true;
    this._timelines.show.play();

    return this;
  }

  /**
   * 隱藏預覽按鈕。
   */
  async hide() {
    if (!this.isShow) return this;

    this.isShow = false;
    this._timelines.show.reverse();

    this._timelines.show.eventCallback("onReverseComplete", null);

    await new Promise((resolve) => {
      this._timelines.show.eventCallback("onReverseComplete", resolve);
    });

    return this;
  }

  /**
   * 設置選擇按鈕時的處理程序。
   * @param {function} handler - 選擇按鈕時的處理程序。
   */
  onSelect(handler) {
    if (this._onSelectHandler)
      this.element.off("click", "button", this._onSelectHandler);

    this._onSelectHandler = handler;

    this.element.on("click", "button", this._onSelectHandler);
    return this;
  }
}

/**
 * 這個類別用於創建和管理預覽圖片檔名組件。
 */
class ImageName extends component {
  constructor() {
    super();

    this.isShow = false;
    this._timelines = {};

    const container = $("<div>")
      .addClass("file-name-container")
      .append(
        $("<p>").addClass("file-name"),
        $("<button>")
          .addClass("extend-button")
          .append($("<label>").text(".jpg"))
      );

    this.element = container;

    this._bindTimeline(container)._createTimelines();
  }

  /**
   * 綁定元素的時間軸效果。
   * @private @param {jQuery} container - 元素的 jQuery 物件。
   */
  _bindTimeline(container) {
    const button = container.find(".extend-button");

    const t1 = createScaleTl(button, 1, 1.1);
    const t2 = createBackgroundColorTl(button, "#ea81af", 0.2);
    const t3 = gsap
      .timeline({ defaults: { ease: "set1", duration: 0.2 }, paused: true })
      .to(button.find("label"), {
        color: "hsl(225, 10%, 23%)",
        fontWeight: "bold",
      });

    const t4 = createScaleYoyoTl(button, 0.8);

    button.on("mouseenter", () => {
      t1.play();
      t2.play();
      t3.play();
    });
    button.on("mouseleave", () => {
      t1.reverse();
      t2.reverse();
      t3.reverse();
    });
    button.on("click", () => t4.restart());

    return this;
  }

  /**
   * 創建並初始化時間軸效果。
   * @private
   */
  _createTimelines() {
    this._timelines.show = gsap
      .timeline({ defaults: { ease: "set1" }, paused: true })
      .from(this.element, { autoAlpha: 0, duration: 0.05 })
      .from(this.element.children(), {
        autoAlpha: 0,
        scale: 0.5,
        ease: "back.out(4)",
        stagger: 0.1,
      });

    return this;
  }

  /**
   * 顯示組件並設置圖片名稱。
   * @param {string} name - 圖片的名稱。
   */
  show(name) {
    if (this.isShow) return this;

    this.element.find(".file-name").text(name);
    this.isShow = true;
    this._timelines.show.play();

    return this;
  }

  /**
   * 隱藏組件。
   */
  async hide() {
    if (!this.isShow) return this;

    this.isShow = false;
    this._timelines.show.reverse();

    this._timelines.show.eventCallback("onReverseComplete", null);

    await new Promise((resolve) => {
      this._timelines.show.eventCallback("onReverseComplete", resolve);
    });

    this.element.find(".file-name").text("");

    return this;
  }
}
