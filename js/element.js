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
   * @private @abstract @returns {JQuery[]} 一個包含圖示元素的陣列。
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
