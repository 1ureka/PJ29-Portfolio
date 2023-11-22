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

  container.on("mouseover", () => t1.play());
  container.on("mouseleave", () => t1.reverse());
  container.on("click", () => t2.restart());

  return container;
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

//
// 複雜
//
/**
 * 創建滾動按鈕，可以是向上或向下的按鈕。
 * @param {Object} config - 用於設定滾動按鈕的配置物件。
 * @returns {jQuery} 滾動按鈕的容器。
 */
function createScrollButton(config) {
  // 預設配置
  const defaultConfig = {
    type: "up",
  };
  // 合併預設配置和用戶提供的配置
  config = { ...defaultConfig, ...config };

  const button = $("<button>").addClass("scroll-button");
  const icon = createScrollIcon();
  if (config.type === "down") gsap.set(icon, { rotate: 180 });

  button.append(icon);

  const t1 = createScrollButtonHoverTl(button);
  const t2 = createScrollButtonClickTl(button);

  button.on("mouseover", () => t1.play());
  button.on("mouseleave", () => t1.reverse());
  button.on("click", () => t2.restart());

  return button;
}

/**
 * 創建搜尋列，包含搜尋圖示、文字輸入框和橡皮擦圖示。
 * @returns {jQuery} 搜尋列的容器。
 */
function createSearchBar() {
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
  const input = inputContainer.find("input");

  const t1 = createOutlineTl(input);
  const t2s = createSearchIconHoverTl(searchIcon);

  function tlplay() {
    t1.play();
    t2s.t1.play();
    t2s.t2.play();
  }
  function tlreverse() {
    t1.reverse();
    t2s.t1.reverse();
    t2s.t2.reverse();
  }

  container.on("mouseover", tlplay);
  container.on("mouseleave", function () {
    if (!input.is(":focus")) tlreverse();
  });

  input.on("focus", tlplay);
  input.on("blur", tlreverse);
  input.on("keyup", function () {
    if (input.val()) {
      eraserIcon.show(350);
      return;
    }
    eraserIcon.hide(350);
  });

  $.extend(container, {
    onInput: function (handler) {
      input.on("keyup", handler);
      return this;
    },
    onCleared: function (handler) {
      eraserIcon.on("click", handler);
      return this;
    },
  });

  return container;
}
