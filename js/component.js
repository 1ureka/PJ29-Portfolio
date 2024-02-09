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
 * header, aside
 */

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
      .createTimeline(this.currentColor, 2)
      .play();

    return this;
  }
}

/**
 * sidebar, modal
 */

/**
 * 這個類別提供創建和控制主要按鈕的功能。
 */
class MainButtons extends component {
  constructor() {
    super();

    const container = $("<div>").addClass("main-buttons-container");
    const options = ["新增", "刪除", "同步"];

    options.forEach((option) =>
      $("<button>")
        .addClass("main-button")
        .appendTo(container)
        .append(`<span>${option}</span>`)
        .append(
          `<svg width="15px" height="10px" viewBox="0 0 13 10">
            <path d="M1,5 L11,5"></path>
            <polyline points="8 1 12 5 8 9"></polyline>
          </svg>`
        )
    );

    this.element = container;
  }

  onSelect(handler) {
    if (this._handler) return this;

    this._handler = (e) => handler($(e.target).find("span").text());

    this.element.on("click", ".main-button", this._handler);

    return this;
  }

  show() {
    $(":root").css("--is-main-button-show", "1");
    $(".main-buttons-container").css("pointerEvents", "auto");
    return this;
  }

  hide() {
    $(":root").css("--is-main-button-show", "0");
    $(".main-buttons-container").css("pointerEvents", "none");
    return this;
  }
}

/**
 * 這個類別提供創建和控制新增選單的功能。
 */
class AddImagePopup extends component {
  constructor() {
    super();

    this._files = [];

    const container = $("<div>")
      .addClass("popup")
      .addClass("add-image-container");

    const buttons = this._createButtons();

    container.append(
      $("<span>").text("• 目標資料夾"),
      this._createSelect(),
      $("<span>").text("• 檔案預覽"),
      this._createContent(),
      buttons.submit,
      buttons.close
    );

    this.element = container;

    this._tl = this._createTimeline();
  }

  _createSelect() {
    return $("<form>")
      .attr("id", "add-image-categories")
      .append(
        $("<div>"),
        $("<input>").attr({
          type: "radio",
          id: "add-image-Scene",
          name: "add-image-categories",
          value: "Scene",
          checked: true,
        }),
        $("<label>").attr("for", "add-image-Scene").text("場景"),
        $("<input>").attr({
          type: "radio",
          id: "add-image-Props",
          name: "add-image-categories",
          value: "Props",
        }),
        $("<label>").attr("for", "add-image-Props").text("物件"),
        $("<input>").attr({
          type: "radio",
          id: "add-image-Nature",
          name: "add-image-categories",
          value: "Nature",
        }),
        $("<label>").attr("for", "add-image-Nature").text("自然")
      );
  }

  _createContent() {
    return $("<div>")
      .addClass("add-imgae-content-overflow")
      .append(
        $("<div>")
          .addClass("add-image-scroll-icons")
          .append(
            $("<div>").addClass("scroll-down-icon").append(this._createSVG1())
          ),
        $("<div>").addClass("add-image-content")
      );
  }

  _createArticle(imgUrl1, imgUrl2, title) {
    return $("<article>").append(
      $("<div>").append(
        $("<img>").attr({ src: imgUrl1, decoding: "async" }),
        $("<img>").attr({ src: imgUrl2, decoding: "async" })
      ),
      $("<p>").text(title)
    );
  }

  _createSVG1() {
    return $(`
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0h24v24H0z" fill="none"></path>
      <path d="M11.9997 13.1716L7.04996 8.22186L5.63574 9.63607L11.9997 16L18.3637 9.63607L16.9495 8.22186L11.9997 13.1716Z" fill="white">
      </path>
    </svg>
    `);
  }

  _createSVG2() {
    return $(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
    </svg>
    `);
  }

  _createButtons() {
    return {
      submit: $("<div>")
        .addClass("add-image-submit")
        .append(
          $("<button>").append(
            $("<div>")
              .addClass("svg-wrapper-1")
              .append(
                $("<div>").addClass("svg-wrapper").append(this._createSVG2())
              ),
            $("<span>").text("送出")
          )
        ),
      close: $("<div>")
        .addClass("add-image-close")
        .append($("<img>").attr("src", "images/icons/close.png")),
    };
  }

  _createTimeline() {
    return gsap
      .timeline({
        defaults: { ease: "back.out(2)" },
        paused: true,
      })
      .fromTo(
        this.element,
        { autoAlpha: 0, y: -200 },
        { duration: 0.7, autoAlpha: 1, y: 0 }
      );
  }

  onClose(handler) {
    if (this._closeHandler) return;
    this._closeHandler = handler;

    this.element.on("click", ".add-image-close", this._closeHandler);

    return this;
  }

  onSubmit(handler) {
    if (this._submitHandler) return;
    this._submitHandler = (e) => {
      const container = $(e.target).parents(".add-image-container");
      const category = container.find("input:checked").attr("id").split("-")[2];
      handler({ category, files: this._files });
    };

    this.element.on("click", ".add-image-submit", this._submitHandler);

    return this;
  }

  async show(items) {
    if (this._inAnimate || this._isShow) return;
    this._inAnimate = true;
    this._isShow = true;

    const content = this.element.find(".add-image-content");
    content.find("article").remove();

    this._files = [];

    items.forEach((item) => {
      this._createArticle(item.url1, item.url2, item.title).appendTo(content);
      this._files.push(item);
    });

    this._tl.play();
    this._tl.eventCallback("onComplete", null);
    await new Promise((resolve) => {
      this._tl.eventCallback("onComplete", resolve);
    });

    this._inAnimate = false;
  }

  async hide() {
    if (this._inAnimate || !this._isShow) return;
    this._inAnimate = true;
    this._isShow = false;

    this._tl.reverse();
    this._tl.eventCallback("onReverseComplete", null);
    await new Promise((resolve) => {
      this._tl.eventCallback("onReverseComplete", resolve);
    });

    this._inAnimate = false;
  }
}

/**
 * 這個類別提供創建和控制刪除選單的功能。
 */
class DeleteImagePopup extends component {
  constructor() {
    super();

    const container = $("<div>")
      .addClass("popup")
      .addClass("delete-image-container");

    container.append(
      $("<span>").text("• 目標資料夾"),
      this._createSelect(),
      $("<span>").text("• 選擇檔案"),
      this._createContent(),
      this._createButton()
    );

    this.element = container;

    this._tl = this._createTimeline();
  }

  _createSelect() {
    return $("<form>")
      .attr("id", "delete-image-categories")
      .append(
        $("<div>"),
        $("<input>").attr({
          type: "radio",
          id: "delete-image-Scene",
          name: "delete-image-categories",
          value: "Scene",
          checked: true,
        }),
        $("<label>").attr("for", "delete-image-Scene").text("場景"),
        $("<input>").attr({
          type: "radio",
          id: "delete-image-Props",
          name: "delete-image-categories",
          value: "Props",
        }),
        $("<label>").attr("for", "delete-image-Props").text("物件"),
        $("<input>").attr({
          type: "radio",
          id: "delete-image-Nature",
          name: "delete-image-categories",
          value: "Nature",
        }),
        $("<label>").attr("for", "delete-image-Nature").text("自然")
      );
  }

  _createContent() {
    return $("<div>")
      .addClass("delete-imgae-content-overflow")
      .append(
        $("<div>")
          .addClass("delete-image-scroll-icons")
          .append(
            $("<div>").addClass("scroll-down-icon").append(this._createSVG1())
          ),
        $("<div>").addClass("delete-image-content")
      );
  }

  _createArticle(name) {
    return $("<article>").append(
      $("<p>").text(name),
      this._createDeleteButton()
    );
  }

  _createDeleteButton() {
    return $("<button>")
      .addClass("delete-image-button")
      .append(
        this._createSVG3(),
        $("<span>").addClass("delete-image-tip").text("刪除")
      );
  }

  _createSVG1() {
    return $(`
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0h24v24H0z" fill="none"></path>
      <path d="M11.9997 13.1716L7.04996 8.22186L5.63574 9.63607L11.9997 16L18.3637 9.63607L16.9495 8.22186L11.9997 13.1716Z" fill="white">
      </path>
    </svg>
    `);
  }

  _createSVG2() {
    return $(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
    </svg>
    `);
  }

  _createSVG3() {
    return $(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 50 59"
    ><path
      fill="#B5BAC1"
      d="M0 7.5C0 5.01472 2.01472 3 4.5 3H45.5C47.9853 3 50 5.01472 50 7.5V7.5C50 8.32843 49.3284 9 48.5 9H1.5C0.671571 9 0 8.32843 0 7.5V7.5Z"
    ></path>
    <path
      fill="#B5BAC1"
      d="M17 3C17 1.34315 18.3431 0 20 0H29.3125C30.9694 0 32.3125 1.34315 32.3125 3V3H17V3Z"
    ></path>
    <path
      fill="#B5BAC1"
      d="M2.18565 18.0974C2.08466 15.821 3.903 13.9202 6.18172 13.9202H43.8189C46.0976 13.9202 47.916 15.821 47.815 18.0975L46.1699 55.1775C46.0751 57.3155 44.314 59.0002 42.1739 59.0002H7.8268C5.68661 59.0002 3.92559 57.3155 3.83073 55.1775L2.18565 18.0974ZM18.0003 49.5402C16.6196 49.5402 15.5003 48.4209 15.5003 47.0402V24.9602C15.5003 23.5795 16.6196 22.4602 18.0003 22.4602C19.381 22.4602 20.5003 23.5795 20.5003 24.9602V47.0402C20.5003 48.4209 19.381 49.5402 18.0003 49.5402ZM29.5003 47.0402C29.5003 48.4209 30.6196 49.5402 32.0003 49.5402C33.381 49.5402 34.5003 48.4209 34.5003 47.0402V24.9602C34.5003 23.5795 33.381 22.4602 32.0003 22.4602C30.6196 22.4602 29.5003 23.5795 29.5003 24.9602V47.0402Z"
      clip-rule="evenodd"
      fill-rule="evenodd"
    ></path>
    <path fill="#B5BAC1" d="M2 13H48L47.6742 21.28H2.32031L2 13Z"></path>
    </svg>
    `);
  }

  _createButton() {
    return $("<div>")
      .addClass("delete-image-close")
      .append($("<img>").attr("src", "images/icons/close.png"));
  }

  _createTimeline() {
    return gsap
      .timeline({
        defaults: { ease: "back.out(2)" },
        paused: true,
      })
      .fromTo(
        this.element,
        { autoAlpha: 0, y: -200 },
        { duration: 0.7, autoAlpha: 1, y: 0 }
      );
  }

  onClose(handler) {
    if (this._closeHandler) return;
    this._closeHandler = handler;

    this.element.on("click", ".delete-image-close", this._closeHandler);

    return this;
  }

  onSelect(handler) {
    if (this._submitHandler) return;
    this._submitHandler = (e) => {
      const container = $(e.target).parents(".delete-image-container");
      const category = container.find("input:checked").attr("id").split("-")[2];
      const name = $(e.target).children("p").text();
      handler({ category, name, element: $(e.target) });
    };

    this.element.on("click", "article", this._submitHandler);

    return this;
  }

  async show(items) {
    if (this._inAnimate || this._isShow) return;
    this._inAnimate = true;
    this._isShow = true;

    $("#delete-image-Scene")[0].checked = true;

    const content = this.element.find(".delete-image-content");
    content.find("article").remove();

    items["Scene"].forEach((name) =>
      this._createArticle(name).appendTo(content)
    );

    this._innerHandler = (e) => {
      content.find("article").remove();
      const category = $(e.target).attr("for").split("-")[2];
      items[category].forEach((name) =>
        this._createArticle(name).appendTo(content)
      );
    };

    this.element.on("click", "form > label", this._innerHandler);

    this._tl.play();
    this._tl.eventCallback("onComplete", null);
    await new Promise((resolve) => {
      this._tl.eventCallback("onComplete", resolve);
    });

    this._inAnimate = false;
  }

  async hide() {
    if (this._inAnimate || !this._isShow) return;
    this._inAnimate = true;
    this._isShow = false;

    this.element.off("click", "form > label", this._innerHandler);

    this._tl.reverse();
    this._tl.eventCallback("onReverseComplete", null);
    await new Promise((resolve) => {
      this._tl.eventCallback("onReverseComplete", resolve);
    });

    this._inAnimate = false;
  }
}

/**
 * content
 */

/**
 * 這個類別提供創建和控制首頁內容的功能。
 */
class Intro extends component {
  constructor() {
    super();

    this._map = {
      Scene: {
        h1: "場景",
        h2: "Scene",
        p: "將日本動畫與遊戲中的經典場景以現實風格重新詮釋的二創作品，同時也包含了以日本鄉村為靈感的原創作品。",
        tags: {
          Japan: "日本",
          Country: "鄉間",
          Sec: "二創",
        },
        mixMode: "normal",
      },
      Props: {
        h1: "物件",
        h2: "Props",
        p: "收錄了各式各樣的模型，從微小的螺絲到建築物，以滿足戶外場景的需要。以實例為依據，提供包裝好的物件，並以模組化的概念幫助場景設計。",
        tags: {
          Instance: "實例",
          Module: "模組化",
        },
        mixMode: "normal",
      },
      Nature: {
        h1: "自然",
        h2: "Nature",
        p: "涵蓋了各種大小的植物，包括小型植物、灌木和樹木，對於複雜的物件提供了實例，同時還為草地等植被預置了調校過參數的粒子系統。",
        tags: {
          Instance: "實例",
          Particle: "粒子系統",
        },
        mixMode: "normal",
      },
    };

    const container = $("<section>")
      .addClass("content-intro")
      .addClass("Scene");

    const left = $("<div>").addClass("content-intro-left");
    const right = $("<div>").addClass("content-intro-right");

    const info = this._createInfo();
    const button = this._createButton();
    left.append(info, button);

    const cards = this._createCards();
    cards.forEach((card) => card.appendTo(right));

    container.append(left, right);
    this.element = container;

    gsap.set(this.element, { autoAlpha: 0 });
  }

  static createURLStyle(urlMap) {
    const backgroundStyle = Object.keys(urlMap.background).map(
      (key) =>
        `.content-intro.${key}::before{background-image: url(${urlMap.background[key]});}`
    );

    const cardStyle = Object.keys(urlMap.card).map(
      (key) =>
        `.content-intro-card-container.${key} .card-image-container{background-image: url(${urlMap.card[key]});}`
    );

    $("<style>")
      .text([...backgroundStyle, ...cardStyle].join(""))
      .appendTo("head");
  }

  _createInfo() {
    return $("<div>")
      .addClass("content-intro-info")
      .append(
        $("<div>").addClass("line"),
        $("<div>")
          .addClass("content-intro-title")
          .append(
            $("<h1>").text(this._map.Scene.h1),
            $("<h2>").attr("lang", "en").text(this._map.Scene.h2),
            $("<div>").addClass("text-mask")
          ),
        $("<p>")
          .text(this._map.Scene.p)
          .append($("<div>").addClass("text-mask"))
      );
  }

  _createButton() {
    return $("<button>")
      .addClass("content-intro-learnmore")
      .append(
        $("<span>")
          .addClass("circle")
          .append($("<span>").addClass("icon arrow")),
        $("<span>").addClass("button-text").text("瀏覽圖片")
      );
  }

  _createCards() {
    return Object.keys(this._map).map((type) => {
      const container = $("<div>")
        .addClass("content-intro-card-container")
        .addClass(type);

      const background = $("<div>")
        .append($("<div>").addClass("card-background"))
        .appendTo(container);
      const article = $("<article>")
        .addClass("content-intro-card")
        .appendTo(container);

      const tags = $("<div>").addClass("card-project-tags");
      Object.entries(this._map[type].tags).forEach((tag) =>
        $("<span>").addClass(tag[0]).text(`• ${tag[1]}`).appendTo(tags)
      );
      const title = $("<div>").append(
        $("<h2>").addClass("card-project-title").text(this._map[type].h1),
        $("<div>").addClass("card-project-hover").append(this._createSVG())
      );

      $("<div>").addClass("card-image-container").appendTo(article);
      $("<div>")
        .addClass("card-project-info")
        .append(title, tags)
        .appendTo(article);

      return container;
    });
  }

  _createSVG() {
    return $(
      '<svg xmlns="http://www.w3.org/2000/svg" \
      width="32px" \
      height="32px" \
      stroke-linejoin="round" \
      stroke-linecap="round" \
      viewBox="0 0 24 24" \
      stroke-width="2" \
      fill="none" \
      stroke="currentColor"> \
        <line y2="12" x2="19" y1="12" x1="5"></line> \
        <polyline points="12 5 19 12 12 19"></polyline> \
      </svg>'
    );
  }

  _createTimeline() {
    const currentTab = this.element.attr("class").split(" ")[1];
    return gsap
      .timeline({
        defaults: { ease: "power2.out" },
        paused: true,
      })
      .fromTo(
        this.element,
        { autoAlpha: 0, filter: "blur(5px)" },
        { ease: "none", duration: 1, autoAlpha: 1, filter: "blur(0px)" }
      )
      .fromTo(
        this.element.find(".content-intro-info").children(),
        { scaleX: 0 },
        { stagger: 0.2, duration: 1, scaleX: 1 },
        "-=0.5"
      )
      .fromTo(
        this.element.find(".content-intro-info").find(".text-mask"),
        { left: 0 },
        { ease: "power2.in", stagger: 0.4, duration: 1, left: "100%" },
        "-=0.5"
      )
      .fromTo(
        this.element.find(".content-intro-learnmore"),
        { autoAlpha: 0, x: -100 },
        { duration: 1, autoAlpha: 1, x: 0 },
        "-=0.7"
      )
      .fromTo(
        this.element
          .find(".content-intro-card-container")
          .not(`.${currentTab}`),
        { x: 350 },
        { stagger: 0.2, duration: 1, x: 0 },
        "-=0.7"
      );
  }

  onSelect(handler) {
    if (this._handler) return;

    const typeMap = {
      "content-intro-learnmore": "learnMore",
      "content-intro-card": "navigate",
    };

    this._handler = (e) => {
      const type = typeMap[$(e.target).attr("class")];

      if (type === "navigate") {
        const target = $(e.target).parent().attr("class").split(" ")[1];
        handler({ type, target });
      } else {
        const target = $(e.target)
          .parents(".content-intro")
          .attr("class")
          .split(" ")[1];
        handler({ type, target });
      }
    };

    this.element.on(
      "click",
      ".content-intro-learnmore, .content-intro-card",
      this._handler
    );
  }

  async switchTab(type) {
    $(".content-intro-learnmore").css("pointerEvents", "none");

    //
    // hide
    await this.hide();

    //
    // background and blend mode
    const originalClass = this.element.attr("class").split(" ")[0];
    this.element
      .attr("class", `${originalClass} ${type}`)
      .find(".content-intro-left")
      .css("mix-blend-mode", this._map[type].mixMode);

    //
    // info
    this.element.find(".content-intro-info h1").text(this._map[type].h1);
    this.element.find(".content-intro-info h2").text(this._map[type].h2);
    this.element
      .find(".content-intro-info p")
      .text(this._map[type].p)
      .append($("<div>").addClass("text-mask"));

    //
    // card
    this.element.find(".content-intro-card-container").css({
      opacity: 1,
      margin: "15px 0px",
      height: "auto",
    });
    this.element.find(`.content-intro-card-container.${type}`).css({
      opacity: 0,
      margin: 0,
      height: 0,
    });

    await delay(100);

    //
    // show
    await this.show();

    $(".content-intro-learnmore").css("pointerEvents", "auto");
  }

  async show() {
    this._tl = this._createTimeline();

    this._tl.play();
    this._tl.eventCallback("onComplete", null);
    await new Promise((resolve) => {
      this._tl.eventCallback("onComplete", resolve);
    });
  }

  async hide() {
    this._tl.reverse();
    this._tl.eventCallback("onReverseComplete", null);
    await new Promise((resolve) => {
      this._tl.eventCallback("onReverseComplete", resolve);
    });
  }
}

/**
 * 這個類別用於創建和管理圖片庫組件。
 */
class Gallery extends component {
  constructor() {
    super();

    this._isRegisterOnSelect = false;
  }

  /**
   * 創建圖片庫的主要元素。 @private
   * @param {string[]} urls - 所有要展示圖片的 URL。
   * @returns {Promise<jQuery>} - 圖片庫的主要元素。
   */
  async _createGallery(urls) {
    const gallery = $("<div>").addClass("gallery");
    const grid = $("<div>").addClass("images-grid");

    const images = await Promise.all(urls.map((url) => this._createImage(url)));

    grid.append(images).appendTo(gallery);

    return gallery;
  }

  /**
   * 創建單個圖片元素。 @private
   * @param {string} url - 圖片的 URL。
   * @returns {Promise<jQuery>} - 創建的圖片容器元素。
   */
  async _createImage(url) {
    const container = $("<div>").addClass("image-container");

    const image = $("<img>").attr("src", url).attr("decoding", "async");
    const reflexContainer = $("<div>")
      .addClass("reflex-container")
      .append($("<div>").addClass("reflex-plane"));

    container.append(reflexContainer, image);

    await decode(image[0]);

    this._bindTimeline(container);

    return container;
  }

  /**
   * 綁定圖片元素的時間軸。 @private
   * @param {jQuery} imageContainer - 圖片容器的jQuery對象。
   */
  _bindTimeline(imageContainer) {
    const image = imageContainer.find("img");
    const element = image.add(imageContainer.find(".reflex-plane"));

    const t1 = gsap
      .timeline({ paused: true })
      .fromTo(
        image,
        { filter: "brightness(0.95)" },
        { duration: 0.2, ease: "set1", filter: "brightness(1.12)" }
      )
      .fromTo(
        imageContainer,
        { scale: 1 },
        { duration: 0.2, ease: "set1", scale: 1.05 },
        "<"
      );
    const t2 = gsap.timeline({ paused: true }).to(imageContainer, {
      duration: 0.15,
      ease: "set1",
      scale: 0.95,
      repeat: 1,
      yoyo: true,
    });

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
   * 創建滑鼠移動事件處理器。 @private
   * @param {jQuery} element - 被處理的元素。
   * @returns {Function} - 滑鼠移動事件處理器函式。
   */
  _createMousemoveHandler(element) {
    return (e) => {
      const centerX = element.offset().left + element.width() / 2;
      const centerY = element.offset().top + element.height() / 2;
      const offsetX = e.pageX - centerX;
      const offsetY = e.pageY - centerY;

      // 計算響應式的旋轉角度，根據元素的寬度和高度進行調整
      const base = { x: 520, y: 290 };
      const scale = {
        x: element.width() / base.x,
        y: element.height() / base.y,
      };
      const responsiveRotateX = -offsetY / (9 * scale.x);
      const responsiveRotateY = offsetX / (15 * scale.y);

      gsap.to(element, {
        overwrite: "auto",
        ease: "back.out(10)",
        duration: 0.5,
        rotateX: responsiveRotateX,
        rotateY: responsiveRotateY,
      });
    };
  }

  /**
   * 創建並初始化圖片庫的時間軸效果。 @private
   * @returns {Gallery} - 回傳 `Gallery` 實例，以便進行方法鏈結。
   */
  _createTimelines() {
    const images = this.element.children().children();
    return gsap
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
  }

  /**
   * 初始化或重置整個gallery
   * @param {string[]} urls - 所有要展示圖片的 URL。
   */
  async _reset(urls) {
    this.element = await this._createGallery(urls);

    if (this._selectHandler)
      this.element.on("click", "img", this._selectHandler);

    if (this._closeHandler)
      this.element.on("click", ".close-btn", this._closeHandler);

    this._tl = this._createTimelines();
    this.appendTo("#content");
  }

  /**
   * 顯示圖片庫。 (包含創建元素)
   * @param {string[]} urls - 所有要展示圖片的 URL。
   * @returns {Promise<Gallery>} - 回傳 `Gallery` 實例，以便進行方法鏈結。
   */
  async show(urls) {
    if (this._inAnimate || this._isShow) return;
    this._inAnimate = true;
    this._isShow = true;

    await this._reset(urls);
    await delay(100);

    this._tl.play();
    this._tl.eventCallback("onComplete", null);
    await new Promise((resolve) => {
      this._tl.eventCallback("onComplete", resolve);
    });

    this._inAnimate = false;

    return this;
  }

  /**
   * 隱藏圖片庫。
   * @returns {Promise<Gallery>} - 回傳 `Gallery` 實例，以便進行方法鏈結。
   */
  async hide() {
    if (this._inAnimate || !this._isShow) return;
    this._inAnimate = true;
    this._isShow = false;

    this.element.find(".image-container").off();

    this._tl.reverse();
    this._tl.eventCallback("onReverseComplete", null);
    await new Promise((resolve) => {
      this._tl.eventCallback("onReverseComplete", resolve);
    });

    this.element.remove();
    this.element = null;
    this._isAppendTo = false;
    this._inAnimate = false;

    return this;
  }

  /**
   * 設定圖片庫選擇事件的處理函數。
   * @param {Function} handler - 選擇事件的處理函數。
   * @returns {Gallery} - 回傳 `Gallery` 實例，以便進行方法鏈結。
   */
  onSelect(handler) {
    if (this._selectHandler)
      this.element.off("click", "img", this._selectHandler);

    this._selectHandler = function () {
      handler($(this));
    };

    return this;
  }

  /**
   * 設定圖片庫返回事件的處理函數。
   * @param {Function} handler - 選擇事件的處理函數。
   * @returns {Gallery} - 回傳 `Gallery` 實例，以便進行方法鏈結。
   */
  onClose(handler) {
    if (this._closeHandler)
      this.element.off("click", ".close-btn", this._closeHandler);

    this._closeHandler = function () {
      handler($(this));
    };

    return this;
  }
}

//
// WIP
//
//
//

// 之後改名為Preview
/**
 * 這個類別用於創建和管理預覽圖片組件。
 */
class PreviewImage extends component {
  constructor() {
    super();

    this.category = "";
    this.url = "";
    this._timelines = {};

    this.isFullscreen = false;
    this._handlers = {};

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

    this.closeBtn = this._createCloseButton();

    this.closeBtn.appendTo("body");

    return container;
  }

  /**
   * 創建關閉按鈕元素。
   * @private @returns {jQuery} - 關閉按鈕元素的 jQuery 物件。
   */
  _createCloseButton() {
    const closeBtn = $("<button>").addClass("close-button");

    const hoverTls = [
      createBackgroundColorTl(closeBtn, "#ea81af"),
      createScaleTl(closeBtn, 1, 1.05),
    ];

    const clickTl = createScaleYoyoTl(closeBtn, 0.75);

    closeBtn.on("mouseenter", () => {
      hoverTls.forEach((tl) => {
        tl.play();
      });
    });
    closeBtn.on("mouseleave", () => {
      hoverTls.forEach((tl) => {
        tl.reverse();
      });
    });
    closeBtn.on("click", () => clickTl.restart());

    // GIF動畫
    const iconContainer = $("<div>").addClass("close-icon-container");

    const makeImg = () => {
      return $("<img>")
        .attr("src", "images/icons/close.png")
        .addClass("close-img")
        .appendTo(iconContainer);
    };
    const makeGif = () => {
      const timestamp = $.now();
      return $("<img>")
        .attr("src", `images/icons/close.gif?timestamp=${timestamp}`)
        .addClass("close-gif")
        .appendTo(iconContainer);
    };

    closeBtn.append(iconContainer);
    makeImg();

    closeBtn.on("mouseenter", () => {
      const imgs = closeBtn.find(".close-img");
      const gif = makeGif().hide();
      gif[0].onload = () => {
        imgs.remove();
        gif.show();
      };
    });
    closeBtn.on("mouseleave", () => {
      const gifs = closeBtn.find(".close-gif");
      gifs.hide(500, () => gifs.remove());
      makeImg().hide().show(500);
    });

    return closeBtn;
  }

  /**
   * 設置關閉事件處理程序。
   * @param {Function} handler - 關閉事件的處理函數。
   */
  onClose(handler) {
    const closeBtn = this.closeBtn;

    if (this._handlers.close) {
      closeBtn.off("click", this._handlers.close);
      this._handlers.close = null;
    }

    this._handlers.close = handler;
    closeBtn.on("click", this._handlers.close);

    return this;
  }

  /**
   * 切換可操作模式。
   */
  async switchMode() {
    const image = this.element.children("img");

    if (this.isFullscreen === false) {
      this._imageZoom = new ImageZoom(image);
      this._imageZoom.on();

      this.isFullscreen = true;
    } else {
      this._imageZoom.off();

      await this._imageZoom.reset();
      this._imageZoom = null;

      this.isFullscreen = false;
    }

    return this;
  }

  /**
   * 創建時間軸效果。
   * @private
   */
  _createTimelines() {
    const image = this.element.children("img");
    this._timelines.show = gsap
      .timeline({ defaults: { ease: "set1", duration: 0.35 }, paused: true })
      .from(this.element, { autoAlpha: 0, duration: 0.05 })
      .from(image, {
        autoAlpha: 0,
        scale: 0.5,
        y: -100,
        ease: "back.out(2)",
      });

    const closeBtn = this.closeBtn;
    this._timelines.showClose = gsap
      .timeline({ defaults: { ease: "set1", duration: 0.35 }, paused: true })
      .from(closeBtn, {
        autoAlpha: 0,
        scale: 0.5,
        ease: "back.out(4)",
      });
  }

  /**
   * 顯示關閉按鈕。
   */
  async showCloseButton() {
    this._timelines.showClose.play();

    this._timelines.showClose.eventCallback("onComplete", null);

    await new Promise((resolve) => {
      this._timelines.showClose.eventCallback("onComplete", resolve);
    });

    return this;
  }

  /**
   * 隱藏關閉按鈕。
   */
  async hideCloseButton() {
    this._timelines.showClose.reverse();

    this._timelines.showClose.eventCallback("onReverseComplete", null);

    await new Promise((resolve) => {
      this._timelines.showClose.eventCallback("onReverseComplete", resolve);
    });

    return this;
  }

  /**
   * 顯示預覽圖片。
   * @param {string} url - 圖片的 URL。
   * @param {string} category - 圖片的類別。
   * @returns {Promise<PreviewImage>} - 回傳 `PreviewImage` 實例，以便進行方法鏈結。
   */
  async show(url, category) {
    this.url = url;
    this.category = category;

    // 下載圖片
    await new Promise((resolve) => {
      const image = new Image();
      image.onload = resolve;
      image.src = this.url;
    });

    // 下載完成後更新圖片
    const imgElement = this.element.children("img")[0];
    imgElement.src = this.url;

    // 更新圖片後開始解碼
    await decode(imgElement);
    await delay(50);

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

// 合併至Preview
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
      const gif = makeGif().hide();
      gif[0].onload = () => {
        imgs.remove();
        gif.show();
      };
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

// 改名與移動至sidebar
/**
 * 這個類別用於創建和管理投影片選單組件。
 */
class LightBox extends component {
  constructor() {
    super();

    this.isShow = false;
    this._timelines = {};
    this._handlers = {};
  }

  /**
   * 非同步方式創建投影片。
   * @private @param {number} index - 目前投影片的索引。
   * @param {string[]} list - 包含所有圖片URL的列表。
   * @returns {Promise<jQuery>} - 包含創建的投影片內容的jQuery對象。
   */
  async _createLightBox(index, list) {
    this.list = list;
    this.index = index;

    const container = $("<div>").addClass("light-boxes-container");
    const buttons = this._createButtons();

    container.append(buttons.prevButton);

    const urls = getArraySegment(index, list);
    const imgs = await Promise.all(urls.map((url) => this._createImage(url)));
    this.imgs = imgs;

    imgs.forEach((img) => img.appendTo(container));

    container.append(buttons.nextButton);

    return container;
  }

  /**
   * 創建單個圖片元素。
   * @private @param {string} url - 圖片的 URL。
   * @returns {Promise<jQuery>} - 創建的圖片容器元素。
   */
  async _createImage(url) {
    const container = $("<div>").addClass("light-box-container");

    const imageContainer = $("<div>").addClass("image-container");
    const image = $("<img>")
      .attr("src", url)
      .attr("decoding", "async")
      .addClass("light-box-image");

    const reflexContainer = $("<div>").addClass("reflex-container");
    $("<div>").addClass("reflex-plane").appendTo(reflexContainer);

    imageContainer.append(reflexContainer, image);

    await decode(image[0]);

    this._bindImageTimeline(imageContainer);

    const filter = $("<img>").addClass("image-filter").attr("src", url);
    container.append(filter, imageContainer);

    this._bindFilterTimeline(container);

    return container;
  }

  /**
   * 綁定圖片元素的時間軸。
   * @private
   * @param {jQuery} imageContainer - 圖片容器的jQuery對象。
   */
  _bindImageTimeline(imageContainer) {
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
   * 綁定背景濾鏡元素的時間軸。
   * @private
   * @param {jQuery} container - 整個容器的jQuery對象。
   */
  _bindFilterTimeline(container) {
    const filter = container.find(".image-filter");

    const tl = gsap
      .timeline({ defaults: { ease: "set1" }, paused: true })
      .from(filter, { autoAlpha: 0, duration: 0.2 });

    container.on("mouseenter", ".light-box-image", () => tl.play());
    container.on("mouseleave", ".light-box-image", () => tl.reverse());
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

      // 計算響應式的旋轉角度，根據元素的寬度和高度進行調整
      const base = { x: 520, y: 290 };
      const scale = {
        x: element.width() / base.x,
        y: element.height() / base.y,
      };
      const responsiveRotateX = -offsetY / (9 * scale.x);
      const responsiveRotateY = offsetX / (15 * scale.y);

      gsap.to(element, {
        overwrite: "auto",
        ease: "back.out(10)",
        duration: 0.5,
        rotateX: responsiveRotateX,
        rotateY: responsiveRotateY,
      });
    };
  }

  /**
   * 創建上下按鈕。
   * @private @returns {{prevButton: jQuery, nextButton: jQuery}}
   */
  _createButtons() {
    const prevButton = $("<button>").addClass("prev-button");
    const nextButton = $("<button>").addClass("next-button");

    const buttons = [prevButton, nextButton];

    buttons.forEach((button, index) => {
      // 普通時間軸
      const hoverTls = [
        createBackgroundColorTl(button, "#ea81af"),
        createScaleTl(button, 1, 1.05),
      ];

      const clickTl = createScaleYoyoTl(button, 0.9);

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
      button.on("click", () => clickTl.restart());

      // GIF動畫
      const iconContainer = $("<div>").addClass("animated-up-icon-container");

      if (index === 1) gsap.set(iconContainer, { rotate: 180 });

      const makeImg = () => {
        return $("<img>")
          .attr("src", "images/icons/up (white).png")
          .addClass("up-img")
          .appendTo(iconContainer);
      };
      const makeGif = () => {
        const timestamp = $.now();
        return $("<img>")
          .attr("src", `images/icons/top (animated).gif?timestamp=${timestamp}`)
          .addClass("animated-up-gif")
          .appendTo(iconContainer);
      };

      button.append(iconContainer);
      makeImg();

      button.on("mouseenter", () => {
        const imgs = button.find(".up-img");
        const gif = makeGif().hide();
        gif[0].onload = () => {
          imgs.remove();
          gif.show();
        };
      });
      button.on("mouseleave", () => {
        const gifs = button.find(".animated-up-gif");
        gifs.hide(500, () => gifs.remove());
        makeImg().hide().show(500);
      });
    });

    return { prevButton, nextButton };
  }

  /**
   * 創建並初始化投影片的時間軸效果。
   * @private
   */
  _createShowTimelines() {
    const elements = this.element.children();
    this._timelines.show = gsap
      .timeline({ defaults: { ease: "set1" }, paused: true })
      .from(this.element, { autoAlpha: 0, duration: 0.05 })
      .from(
        elements,
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
   * 創建投影片隱藏的時間軸效果。
   * @private
   */
  _createHideTimelines() {
    const elements = this.element.children();
    this._timelines.hide = gsap
      .timeline({ defaults: { ease: "set1" }, paused: true })
      .to(elements, {
        autoAlpha: 0,
        scale: 0.5,
        ease: "back.in(2)",
        stagger: { from: "random", amount: 0.35 },
      })
      .to(this.element, { autoAlpha: 0, duration: 0.05 });

    return this;
  }

  /**
   * 顯示投影片。
   */
  async show(index, list, category) {
    if (this.isShow) return this;

    this.category = category;
    this.element = await this._createLightBox(index, list);
    this._createShowTimelines().appendTo("#sidebar");

    // 註冊事件
    if (this._handlers.next)
      this.element.on("click", ".next-button", this._handlers.next);
    if (this._handlers.prev)
      this.element.on("click", ".prev-button", this._handlers.prev);
    if (this._handlers.select)
      this.element.on("click", ".light-box-image", this._handlers.select);

    this.isShow = true;
    this._timelines.show.play();

    return this;
  }

  /**
   * 隱藏投影片。
   */
  async hide() {
    if (!this.isShow) return this;

    this.isShow = false;

    this._createHideTimelines();
    this._timelines.hide.play();

    this._timelines.hide.eventCallback("onComplete", null);

    await new Promise((resolve) => {
      this._timelines.hide.eventCallback("onComplete", resolve);
    });

    this.element.off();
    this.element.remove();
    this.element = null;
    this.list = [];
    this.index = -1;
    this.imgs = [];
    this._isAppendTo = false;

    return this;
  }

  /**
   * 投影片切換至下張圖片。
   * @param {number} offset - 偏移張數。
   * @returns {Promise<void>} - 表示異步操作完成的 Promise 物件。
   */
  async toNext(offset = 1) {
    // 提取變數
    const length = this.list.length;
    const newIndex = (this.index + offset) % length; // 新的中間位置在this.list中的指標
    const nextButton = this.element.children(".next-button");

    // 準備新圖片
    const urls = Array.from(
      { length: offset },
      (_, i) => this.list[(newIndex + 2 - i) % length]
    ).reverse();
    const promises = urls.map((url) => this._createImage(url));
    const imgs = await Promise.all(promises);

    // 創建與"初始化"時間軸
    const tl = gsap
      .timeline({
        defaults: { ease: "power2.out", duration: 0.5 },
        paused: true,
      })
      .to(this.imgs.slice(0, offset), { autoAlpha: 0, height: 0, margin: 0 })
      .from(imgs, { autoAlpha: 0, height: 0, margin: 0 }, "<");

    imgs.forEach((img) => img.insertBefore(nextButton));

    // 投影片切換
    await new Promise((resolve) => {
      tl.play();
      tl.eventCallback("onComplete", resolve);
    });

    // 更新屬性
    this.index = newIndex;
    this.imgs.slice(0, offset).forEach((img) => img.remove());
    this.imgs.splice(0, offset);
    this.imgs.push(...imgs);
  }

  /**
   * 投影片切換至上張圖片。
   * @async
   * @param {number} offset - 偏移張數。
   * @returns {Promise<void>} - 表示異步操作完成的 Promise 物件。
   */
  async toPrev(offset = 1) {
    // 提取變數
    const length = this.list.length;
    const newIndex = (this.index - offset + length) % length; // 新的中間位置在this.list中的指標
    const prevButton = this.element.children(".prev-button");

    // 準備新圖片
    const urls = Array.from(
      { length: offset },
      (_, i) => this.list[(newIndex - 2 + i + length) % length]
    ).reverse();
    const promises = urls.map((url) => this._createImage(url));
    const imgs = await Promise.all(promises);

    // 創建與"初始化"時間軸
    const tl = gsap
      .timeline({
        defaults: { ease: "power2.out", duration: 0.5 },
        paused: true,
      })
      .to(this.imgs.slice(5 - offset, 5), {
        autoAlpha: 0,
        height: 0,
        margin: 0,
      })
      .from(imgs, { autoAlpha: 0, height: 0, margin: 0 }, "<");

    imgs.forEach((img) => img.insertAfter(prevButton));

    // 投影片切換
    await new Promise((resolve) => {
      tl.play();
      tl.eventCallback("onComplete", resolve);
    });

    // 更新屬性
    this.index = newIndex;
    this.imgs.slice(5 - offset, 5).forEach((img) => img.remove());
    this.imgs.splice(-offset);
    imgs.reverse(); // 確保順序正確
    this.imgs.unshift(...imgs);
  }

  /**
   * 註冊下一張圖片事件處理程序。
   * @param {Function} handler - 處理程序函數，接收新圖片的 URL 作為參數。
   * @returns {LightBox} - 返回 LightBox 實例，支持鏈式調用。
   */
  onNext(handler) {
    // 記錄至屬性
    if (this._handlers.next) {
      console.error("lightBox: 已註冊onNext");
      return;
    }

    this._handlers.next = () => {
      const index = (this.index + 1) % this.list.length;
      const url = this.list[index];

      handler(url);
    };

    return this;
  }

  /**
   * 註冊上一張圖片事件處理程序。
   * @param {Function} handler - 處理程序函數，接收新圖片的 URL 作為參數。
   * @returns {LightBox} - 返回 LightBox 實例，支持鏈式調用。
   */
  onPrev(handler) {
    // 記錄至屬性
    if (this._handlers.prev) {
      console.error("lightBox: 已註冊onPrev");
      return;
    }

    this._handlers.prev = () => {
      const index = (this.index - 1 + this.list.length) % this.list.length;
      const url = this.list[index];

      handler(url);
    };

    return this;
  }

  /**
   * 註冊選擇圖片事件處理程序。
   * @param {Function} handler - 處理程序函數，接收選擇圖片的 URL 和索引作為參數。
   * @returns {LightBox} - 返回 LightBox 實例，支持鏈式調用。
   */
  onSelect(handler) {
    // 記錄至屬性
    if (this._handlers.select) {
      console.error("lightBox: 已註冊onPrev");
      return;
    }

    this._handlers.select = (e) => {
      const url = e.target.src.replace("/thumbnail/", "/jpg/");
      const index = $(e.target).parents(".light-box-container").index();

      handler(url, index);
    };

    return this;
  }
}

// 改名為FileName與移動至header
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

  /**
   * 修改元素的名稱。
   * @param {string} name - 新的名稱。
   */
  changeName(name) {
    const nameElement = this.element.find(".file-name");
    const oldName = nameElement.text();

    if (name === oldName) return this;

    nameElement.text(name);

    return this;
  }
}
