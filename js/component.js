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

  /**
   * 開關class
   * @param {string}   className 類名
   * @param {string} bool
   */
  toggleClass(className, bool) {
    this.element.toggleClass(className, bool);
  }
}

/**
 * header
 */

/**
 * 這個類別用於創建和管理在header的元素
 */
class Header extends component {
  constructor(colorMap) {
    super();

    this.element = $("#header");

    /** 燈泡目前的色彩。 @type {string | "off"} */
    this._currentColor = "off";
    this._colorMap = colorMap;
    this._bulb = new Bulb(30, 30);

    // return button
    const { button, makeImg, makeGif } = this._createReturnButton();
    this._attachButtonEvents(button, makeImg, makeGif);

    this.element.append(this._bulb.element, button);
  }
  /** 切換燈泡的顏色。 @param {string} gallery */
  switchLight(gallery) {
    this._currentColor = this._colorMap[gallery];
    this._flickerLight();
    return this;
  }
  /** 使燈泡的顏色閃爍。 @private */
  _flickerLight() {
    if (this._bulbTl) this._bulbTl.kill();
    this._bulbTl = this._bulb.createTimeline(this._currentColor, 2).play();
    return this;
  }

  _createReturnButton() {
    const iconContainer = $("<div>").addClass("return-button-icon");

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

    makeImg();

    const button = $("<button>")
      .addClass("return-button")
      .addClass("hide")
      .append(
        iconContainer,
        $("<span>").addClass("return-button-tip").text("返回")
      );

    return { button, makeImg, makeGif };
  }

  _attachButtonEvents(button, makeImg, makeGif) {
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
  }

  async show() {
    this.element.find(".return-button").toggleClass("hide", false);
  }

  async hide() {
    this.element.find(".return-button").toggleClass("hide", true);
  }

  onReturn(handler) {
    if (this._handler) this.element.off("click", this._handler);

    this._handler = function () {
      handler($(this));
    };

    this.element.on("click", ".return-button", this._handler);

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

    this._tl = this._createTimeline();
  }

  onSelect(handler) {
    if (this._handler) return this;

    this._handler = (e) => handler($(e.target).find("span").text());

    this.element.on("click", ".main-button", this._handler);

    return this;
  }

  _createTimeline() {
    const options = this.element.find("button");
    return gsap
      .timeline({ defaults: { ease: "back.out(2)" }, paused: true })
      .fromTo(
        options,
        {
          autoAlpha: 0,
          x: -100,
        },
        {
          autoAlpha: 1,
          x: 0,
          stagger: { from: "start", amount: 0.6 },
          duration: 1,
        }
      );
  }

  async show() {
    if (this._inAnimate || this._isShow) return this;
    this._inAnimate = true;
    this._isShow = true;

    this._tl.play();
    this._tl.eventCallback("onComplete", null);
    await new Promise((resolve) => {
      this._tl.eventCallback("onComplete", resolve);
    });

    this._inAnimate = false;

    $(".main-buttons-container").css("pointerEvents", "auto");

    return this;
  }

  async hide() {
    if (this._inAnimate || !this._isShow) return this;
    this._inAnimate = true;
    this._isShow = false;

    this._tl.reverse();
    this._tl.eventCallback("onReverseComplete", null);
    await new Promise((resolve) => {
      this._tl.eventCallback("onReverseComplete", resolve);
    });

    this._inAnimate = false;

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

    this.element = $("<div>").addClass("popup-container").append(container);

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
        { autoAlpha: 0 },
        { duration: 0.25, autoAlpha: 1, ease: "none" }
      )
      .fromTo(
        this.element.children(),
        { autoAlpha: 0, y: -200 },
        { duration: 0.7, autoAlpha: 1, y: 0 },
        "<"
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

    this.element = $("<div>").addClass("popup-container").append(container);

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
        { autoAlpha: 0 },
        { duration: 0.25, autoAlpha: 1, ease: "none" }
      )
      .fromTo(
        this.element.children(),
        { autoAlpha: 0, y: -200 },
        { duration: 0.7, autoAlpha: 1, y: 0 },
        "<"
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

    container.append(this._createBackground(), left, right);

    this.element = container;
    this._tl = this._createTimeline();
  }

  static createURLStyle(urlMap) {
    const backgroundStyle = Object.keys(urlMap.background).map(
      (key) =>
        `.content-background > .${key}{background-image: url(${urlMap.background[key]});}`
    );

    const cardStyle = Object.keys(urlMap.card).map(
      (key) =>
        `.content-intro-card-container.${key} .card-image-container{background-image: url(${urlMap.card[key]});}`
    );

    $("<style>")
      .text([...backgroundStyle, ...cardStyle].join(""))
      .appendTo("head");
  }

  _createBackground() {
    const background = $("<div>").addClass("content-background");

    background.append(
      $("<div>").addClass("Scene"),
      $("<div>").addClass("Props"),
      $("<div>").addClass("Nature")
    );

    return background;
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
        this.element.find(".content-intro-info"),
        { autoAlpha: 0, filter: "blur(10px)" },
        { ease: "none", duration: 1, autoAlpha: 1, filter: "blur(0px)" }
      )
      .fromTo(
        this.element.find(".content-intro-info").children(),
        { scaleX: 0 },
        { stagger: 0.2, duration: 1, scaleX: 1 },
        "<"
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
    //
    // background
    const changClass = () => {
      const originalClass = this.element.attr("class").split(" ")[0];
      this.element.attr("class", `${originalClass} ${type}`);
    };
    (async function () {
      await delay(2200);
      changClass();
    })();

    //
    // hide
    await this.hide();

    //
    // blend mode
    this.element
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

    //
    // show
    changClass();
    await this.show();
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
 * 這個類別用於創建和管理預覽圖片組件。
 */
class Preview extends component {
  constructor() {
    super();

    const intro = this._createIntro();
    const preview = this._createImage();

    const container = $("<div>")
      .addClass("preview-container")
      .append(intro, preview);

    this.element = container;

    this._createTimeline();
  }

  _createIntro() {
    return $("<section>")
      .addClass("preview-intro")
      .append(
        $("<div>").addClass("line"),
        $("<h1>"),
        $("<div>").addClass("text-mask")
      );
  }

  _createImage() {
    return $("<section>").addClass("preview-image-container");
  }

  _changeTitle(title) {
    const h1 = this.element.find("h1");
    h1.text(title);
  }

  _createTimeline() {
    this._tl = gsap
      .timeline({ paused: true })
      .fromTo(
        this.element,
        { autoAlpha: 0, filter: "blur(10px)" },
        { duration: 0.5, autoAlpha: 1, filter: "blur(0px)" },
        "<"
      )
      .fromTo(
        this.element.find(".text-mask"),
        { left: 0 },
        { ease: "power2.in", duration: 0.5, left: "100%" },
        "<"
      )
      .fromTo(
        this.element.find(".preview-intro"),
        { scaleX: 0 },
        { duration: 0.5, scaleX: 1 },
        "-=0.5"
      );
  }

  async show(title) {
    this._changeTitle(title);
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
 * 這個類別用於創建和管理lightBox組件。
 */
class LightBox extends component {
  constructor() {
    super();

    const styleTag = document.createElement("style");
    document.head.appendChild(styleTag);
    styleTag.sheet.insertRule(`
    .light-box-active::after {
      background: url("images/icons/play.png");
      background-size: 20px 20px;
    }
    `);

    this.element = $("<section>").addClass("light-box");
    this.element.css("pointerEvents", "none");

    this._bindHoverEvents();
    this._bindSwitchEvents();
  }

  async _create(urls, index) {
    const container = $("<div>").addClass("light-box-images-container");
    const figures = await this._createFigures(urls, index);
    figures.forEach((figure) => figure.appendTo(container));

    const scroller = $("<div>")
      .addClass("light-box-scroller")
      .append(container);

    return scroller;
  }

  async _createFigures(urls, index) {
    const imagesFront = await Promise.all(
      urls.map((url) => this._createImage(url, "light-box-image"))
    );
    const imagesBack = await Promise.all(
      urls.map((url) => this._createImage(url, "light-box-image-back"))
    );
    const images = imagesFront.map((image, index) => {
      return [imagesBack[index], image];
    });

    const figures = images.map((image, i) => {
      const figure = $("<figure>")
        .addClass("light-box-image-container")
        .append($("<div>").append(image[0], image[1]));

      if (i === index) figure.addClass("light-box-active");

      return figure;
    });

    return figures;
  }

  async _createImage(url, className) {
    const image = $("<img>")
      .attr("src", url)
      .attr("decoding", "async")
      .addClass(className);

    await decode(image[0]);

    return image;
  }

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

  _bindHoverEvents() {
    /** @type {(e: any) => void} */
    let mousemoveHandler;

    this.element.on("mouseenter", ".light-box-image-container", (e) => {
      const figure = $(e.target);
      const div = figure.children("div");

      mousemoveHandler = this._createMousemoveHandler(div);

      figure.on("mousemove", mousemoveHandler);
    });
    this.element.on("mouseleave", ".light-box-image-container", (e) => {
      const figure = $(e.target);
      const div = figure.children("div");

      figure.off("mousemove", mousemoveHandler);

      gsap.to(div, {
        overwrite: "auto",
        ease: "set1",
        duration: 0.5,
        rotateX: 0,
        rotateY: 0,
      });
    });
  }

  _bindSwitchEvents() {
    this.element.on("click", ".light-box-image-container", async (e) => {
      const { target } = e;
      const index = $(target).index();

      this.element.find(".light-box-active").removeClass("light-box-active");
      this.element
        .find(".light-box-image-container")
        .eq(index)
        .addClass("light-box-active");
    });
  }

  onSelect(handler) {
    if (this._handler) return;

    this._handler = (e) => {
      const { target } = e;
      const index = $(target).index();

      handler(index);
    };

    this.element.on("click", ".light-box-image-container", this._handler);
  }

  _createTimeline() {
    return gsap.timeline({ paused: true }).fromTo(
      this.element.find("figure"),
      { scale: 0 },
      {
        scale: 1,
        stagger: { from: "random", amount: 0.7 },
        ease: "back.out(2)",
      }
    );
  }

  async show(urls, index) {
    if (this._inAnimate || this._isShow) return this;
    this._inAnimate = true;
    this._isShow = true;

    const lightbox = await this._create(urls, index);
    const mask = $("<div>").addClass("light-box-mask");
    this.element.append(lightbox, mask);

    this._tl = this._createTimeline();

    this._tl.play();
    this._tl.eventCallback("onComplete", null);
    await new Promise((resolve) => {
      this._tl.eventCallback("onComplete", resolve);
    });

    this.element.css("pointerEvents", "auto");
    this._inAnimate = false;

    return this;
  }

  async hide() {
    if (this._inAnimate || !this._isShow) return this;
    this._inAnimate = true;
    this._isShow = false;

    this._tl.reverse();
    this._tl.eventCallback("onReverseComplete", null);
    await new Promise((resolve) => {
      this._tl.eventCallback("onReverseComplete", resolve);
    });

    this.element.children().remove();
    this.element.css("pointerEvents", "none");
    this._inAnimate = false;

    return this;
  }
}

/**
 * other
 */

/**
 * 這個類別用於創建和管理LoadingIcon組件。
 */
class LoadingIcon extends component {
  constructor() {
    super();

    const wrapper = $("<div>").addClass("loading-icon-wrapper");
    const array = [0, 1, 2, 3];

    array.forEach(() =>
      $("<div>").addClass("loading-icon-circle").appendTo(wrapper)
    );
    array.forEach(() =>
      $("<div>").addClass("loading-icon-shadow").appendTo(wrapper)
    );

    this.element = wrapper;
    this._tl = this._createTimeline();
  }

  _createTimeline() {
    return gsap
      .timeline({
        defaults: { ease: "set1" },
        paused: true,
      })
      .fromTo(
        this.element,
        { autoAlpha: 0, filter: "blur(10px)" },
        { duration: 0.65, autoAlpha: 1, filter: "blur(0px)" }
      );
  }

  async show() {
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
