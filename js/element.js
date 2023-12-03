/**
 * 表示一個圖示的介面，包含圖示元素和時間軸。 @class
 */
class IconInterface {
  constructor() {
    /** 用於存儲圖示元素的陣列。 @type {JQuery[]} */
    this.element = this._createIcon();
    /** 於存儲時間軸的陣列。 @type {TimelineMax[]} */
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
   * @private @abstract @returns {TimelineMax[]} 一個包含時間軸的陣列。
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
 * 表示一個圖示的工廠，可以根據指定的類型創建不同種類的圖示。 @class
 */
class IconFac {
  constructor() {
    /**
     * 包含不同類型圖示的工廠方法映射。
     * @type {Object.<string, Function>}
     */
    this.map = {
      scroll: () => new ScrollIcon(),
      sort: () => new SortIcon(),
      name: () => new NameIcon(),
      date: () => new DateIcon(),
      size: () => new SizeIcon(),
    };
  }

  /**
   * 根據指定的類型創建對應的圖示。
   * @param {string} type - 圖示的類型。
   * @returns {IconInterface} 具體類型的圖示實例。
   */
  type(type) {
    return this.map[type]();
  }
}

const Icon = new IconFac();
