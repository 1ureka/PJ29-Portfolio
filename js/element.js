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
 * 滾動圖示
 */
class SearchIcon extends IconInterface {
  constructor() {
    super();
  }

  _createIcon() {
    const container = $("<div>").addClass("search-icon-container");

    const lens = $("<div>").addClass("search-icon-lens");
    const inner1 = $("<div>").addClass("search-icon-inner");
    const inner2 = $("<div>").addClass("search-icon-inner");
    gsap.set(inner1.add(inner2), { rotate: 5 });
    gsap.set(inner2, { x: -10 });
    lens.append(inner1, inner2);

    const img = $("<img>")
      .addClass("search-icon-img")
      .attr("src", `images/icons/search.png`);

    container.append(lens, img);

    return container;
  }

  _createTimeline() {
    const container = this.element;

    const timelines = [];

    const t1 = gsap
      .timeline({ defaults: { ease: "set1", duration: 0.6 }, paused: true })
      .to(container.find(".search-icon-inner"), {
        x: "+=40",
        rotate: 20,
      });
    const t2 = gsap
      .timeline({ defaults: { ease: "set1", duration: 0.3 }, paused: true })
      .to(container, {
        scale: 1.1,
        rotate: "+=15",
        transformOrigin: "16.5px 17px",
      });

    timelines.push(t1, t2);

    return timelines;
  }
}

/**
 * 橡皮擦圖示
 */
class EraserIcon extends IconInterface {
  constructor() {
    super();
  }

  _createIcon() {
    const container = $("<div>").addClass("eraser-icon-container").hide();

    const img1 = $("<img>").attr("src", `images/icons/erase (line).png`);
    const img2 = $("<img>").attr("src", `images/icons/erase.png`);
    gsap.set(img2, { x: 10 });

    container.append(img1, img2);

    return container;
  }

  _createTimeline() {
    const container = this.element;

    const hoverTl = gsap
      .timeline({
        defaults: { duration: 0.2, ease: "set1" },
        paused: true,
      })
      .to(container.find("img").eq(1), { x: -5 });

    const clickTl = gsap
      .timeline({
        defaults: { duration: 0.1, ease: "set1" },
        paused: true,
      })
      .to(container, {
        scale: 0.7,
        yoyo: true,
        repeat: 1,
        onComplete: () => container.hide(350),
      });

    container.on("mouseenter", () => hoverTl.play());
    container.on("mouseleave", () => hoverTl.reverse());
    container.on("click", () => clickTl.restart());

    return [];
  }
}

/**
 * 資料夾圖示
 */
class FolderIcon extends IconInterface {
  constructor(borderColor) {
    super();

    this.borderColor = borderColor;

    this.element = this._createIcon();

    this.timeline = this._createTimeline();
  }

  _createIcon() {
    const themes = ["white", "dark"];

    const createImg = (theme) => {
      const container = $("<div>").addClass("folder-icon-container");

      const img = $("<img>")
        .addClass("folder-icon-img")
        .attr("src", `images/icons/folder (${theme}).png`);

      const front = $("<div>")
        .addClass("folder-icon-front")
        .css("backgroundColor", theme === "white" ? "white" : this.borderColor)
        .css("borderColor", theme === "white" ? this.borderColor : "#ea81af");

      container.append(img, front);

      return container;
    };

    const icons = themes.map((theme) => createImg(theme));

    return icons;
  }

  _createTimeline() {
    const timelines = [];

    this.element.forEach((container) => {
      const front = container.find(".folder-icon-front");

      const frontTimeline = gsap
        .timeline({ defaults: { duration: 0.2, ease: "set1" }, paused: true })
        .to(front, {
          rotateY: -30,
          rotateX: 30,
          width: 38,
        });

      timelines.push(frontTimeline);
    });

    return timelines;
  }
}

/**
 * 排序圖示
 */
class SortIcon extends IconInterface {
  constructor() {
    super();
  }

  _createIcon() {
    const container = $("<div>").addClass("sort-icon-container");

    const themes = ["white", "dark"];

    const createImg = (theme) => {
      const container = $("<div>").addClass("sort-img-container");

      const lines = Array.from({ length: 4 }, (_, index) =>
        $("<img>")
          .attr("src", `images/icons/sort (line${index + 1}) (${theme}).png`)
          .css("transformOrigin", `${30 - index * 3}px ${8 + index * 8}px`)
          .addClass("sort-img-line")
      );

      const arrows = Array.from({ length: 2 }, () =>
        $("<img>")
          .attr("src", `images/icons/sort (arrow) (${theme}).png`)
          .addClass("sort-img-arrow")
      );

      const arrow2 = arrows[1];
      gsap.set(arrow2, { y: 40 });

      return container.append(...lines, ...arrows);
    };

    const imgs = themes.map((theme) => createImg(theme));

    return [container.append(imgs)];
  }

  _createTimeline() {
    const container = this.element[0];
    const icons = container.find(".sort-img-container");
    const whiteIcon = icons.eq(0);
    const darkIcon = icons.eq(1);

    gsap.set(darkIcon, { autoAlpha: 0 });

    const timelines = [];

    const t1 = gsap
      .timeline({ defaults: { duration: 0.35, ease: "set1" }, paused: true })
      .to(icons.find(".sort-img-arrow"), { y: "-=40", delay: 0.1 });

    const t2 = gsap
      .timeline({ defaults: { duration: 0.35 }, paused: true })
      .to(whiteIcon.find(".sort-img-line"), {
        scale: 0.25,
        rotate: 15,
        stagger: { each: -0.1, yoyo: true, repeat: 1 },
        ease: "back.in(4)",
      });

    const t3 = gsap
      .timeline({ defaults: { duration: 0.35 }, paused: true })
      .to(darkIcon.find(".sort-img-line"), {
        scale: 0.25,
        rotate: 15,
        stagger: { each: -0.1, yoyo: true, repeat: 1 },
        ease: "back.in(4)",
      });

    const t4 = gsap
      .timeline({ defaults: { duration: 0.2, ease: "set1" }, paused: true })
      .to(icons, { scale: 1.25 })
      .to(whiteIcon, { autoAlpha: 0 }, "<")
      .to(darkIcon, { autoAlpha: 1 }, "<");

    timelines.push(t1, t2, t3, t4);

    return timelines;
  }
}

/**
 * 名稱圖示
 */
class NameIcon extends IconInterface {
  constructor() {
    super();
  }

  _createIcon() {
    const themes = ["white", "dark"];

    const createImg = (theme) => {
      const container = $("<div>").addClass("name-icon-container");

      return container.append(
        $("<img>").attr("src", `images/icons/name (frame) (${theme}).png`),
        $("<img>").attr("src", `images/icons/name (inner1) (${theme}).png`),
        $("<img>").attr("src", `images/icons/name (inner2) (${theme}).png`)
      );
    };

    const icons = themes.map((theme) => createImg(theme));

    return icons;
  }

  _createTimeline() {
    const timelines = [];

    this.element.forEach((container) => {
      const t1 = gsap
        .timeline({ defaults: { duration: 0.35 }, paused: true })
        .to(container.children().slice(1), {
          scale: 0.25,
          rotate: -15,
          stagger: { each: 0.1, yoyo: true, repeat: 1 },
          ease: "back.in(4)",
        });

      const t2 = gsap
        .timeline({ defaults: { duration: 0.2, ease: "set1" }, paused: true })
        .to(container, { scale: 1.25 });

      timelines.push(t1, t2);
    });

    return timelines;
  }
}

/**
 * 日期圖示
 */
class DateIcon extends IconInterface {
  constructor() {
    super();
  }

  _createIcon() {
    const themes = ["white", "dark"];

    const createImg = (theme) => {
      const container = $("<div>").addClass("date-icon-container");

      return container.append($("<img>").attr("src", ``));
    };

    const icons = themes.map((theme) => createImg(theme));

    return icons;
  }

  _createTimeline() {
    const timelines = [gsap.timeline()];

    return timelines;
  }
}

/**
 * 檔案大小圖示
 */
class SizeIcon extends IconInterface {
  constructor() {
    super();
  }

  _createIcon() {
    const themes = ["white", "dark"];

    const createImg = (theme) => {
      const container = $("<div>").addClass("size-icon-container");

      return container.append($("<img>").attr("src", ``));
    };

    const icons = themes.map((theme) => createImg(theme));

    return icons;
  }

  _createTimeline() {
    const timelines = [gsap.timeline()];

    return timelines;
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
 * 垂直分割線元素
 */
class VerticalSeparator {
  constructor(config) {
    this.element = this._createSeparator(config);
  }

  _createSeparator(config) {
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
        defaults: { duration: 0.2, ease: "set1" },
        paused: true,
      })
      .to(bulb, { backgroundColor: c }, "<")
      .to(bulbFilter, { filter: "blur(3px)" }, "<")
      .to(bulb, { boxShadow: `0 0 20px ${i * 5}px ${c}` }, "<")
      .to(bulb, { boxShadow: `0 0 20px 0px ${c}` });

    return tl;
  }
}
