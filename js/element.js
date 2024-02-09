/**
 * 表示一個圖示的介面，包含圖示元素和時間軸。 @class
 */
class IconInterface {
  constructor() {
    /** 用於存儲圖示元素的陣列。 @type {JQuery[] | JQuery} */
    this.element = this._createIcon();
    /** 於存儲時間軸的陣列。 @type {TimelineMax[] | TimelineMax} */
    this.timeline = this._createTimeline();
  }

  /**
   * 創建圖示元素的方法，應該由子類實現。
   * @private @abstract @returns {JQuery[] | JQuery} 一個包含圖示元素的陣列。
   */
  _createIcon() {
    return [];
  }

  /**
   * 創建時間軸的方法，應該由子類實現。
   * @private @abstract @returns {TimelineMax[] | TimelineMax} 一個包含時間軸的陣列。
   */
  _createTimeline() {
    return [];
  }
}

/**
 * 滾動圖示
 */
class ScrollIcon extends IconInterface {
  constructor() {
    super();
  }

  _createIcon() {
    const container = $("<div>").addClass("scroll-icon-container");

    const img1 = $("<img>")
      .addClass("scroll-icon-img")
      .attr("src", `images/icons/up (white).png`);
    const img2 = $("<img>")
      .addClass("scroll-icon-img")
      .attr("src", `images/icons/up (dark).png`);
    gsap.set(img2, { y: 40 });

    container.append(img1, img2);
    return container;
  }

  _createTimeline() {
    const container = this.element;

    const tl = gsap
      .timeline({
        defaults: { duration: 0.2, ease: "set1" },
        paused: true,
      })
      .to(container.find("img")[0], { y: -40 })
      .to(container.find("img")[1], { y: 0 }, "<")
      .to(container, { scale: 1.2 }, "<");

    return [tl];
  }
}

/**
 * 全螢幕圖示
 */
class FullscreenIcon extends IconInterface {
  constructor() {
    super();
  }

  _createIcon() {
    const container = $("<div>").addClass("fullscreen-icon-container");

    for (let n = 1; n < 9; n++) {
      const img = $("<img>")
        .attr("src", `images/icons/fullscreen ${n}.png`)
        .appendTo(container);
      if (n >= 5) gsap.set(img, { autoAlpha: 0 });
    }

    return container;
  }

  _createTimeline() {
    const img1 = this.element.find("img").slice(0, 4);
    const img2 = this.element.find("img").slice(4);

    gsap.set(img2, { autoAlpha: 0, scale: 0.5 });

    return gsap
      .timeline({
        defaults: { duration: 0.15, ease: "back.out(4)", stagger: 0.05 },
        paused: true,
      })
      .to(img1, { autoAlpha: 0, scale: 0.5, ease: "back.in(3)" })
      .to(img2, { autoAlpha: 1, scale: 1 });
  }
}

/**
 * 燈泡元素
 */
class Bulb {
  constructor(width, height) {
    this.element = this._createBulb(width, height);
  }

  _createBulb(width, height) {
    const container = $("<div>")
      .addClass("bulb-container")
      .css({
        width: `${width + 20}px`,
        height: `${height + 20}px`,
      });

    const bulb = $("<div>")
      .addClass("bulb")
      .css({ width: `${width}px`, height: `${height}px` });
    const bulbFilter = $("<div>")
      .addClass("bulb-filter")
      .css({ width: `${width}px`, height: `${height}px` });

    bulbFilter.appendTo(bulb);

    bulb.appendTo(container);

    return container;
  }

  createTimeline(toColor, toIntensity = 1) {
    const i = toIntensity;
    const c = toColor;

    const bulb = this.element.find(".bulb");
    const bulbFilter = this.element.find(".bulb-filter");

    const tl = gsap
      .timeline({
        defaults: { duration: 0.5, ease: "set1" },
        paused: true,
      })
      .to(bulb, { backgroundColor: c }, "<")
      .to(bulbFilter, { filter: "blur(3px)" }, "<")
      .to(bulb, { boxShadow: `0 0 20px ${i * 5}px ${c}` }, "<")
      .to(bulb, { boxShadow: `0 0 20px 0px ${c}` });

    return tl;
  }
}
