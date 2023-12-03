//
// 自定義型
//
function createFolderButtonHoverTl(button) {
  gsap.set(button.find(".folder-button-layer2 > *"), { y: -40 });

  const buttonTimeline = gsap
    .timeline({ defaults: { duration: 0.2, ease: "set1" }, paused: true })
    .to(button, { x: 10, backgroundColor: "#ea81af" })
    .fromTo(button, { scale: 1 }, { scale: 1.05 }, "<")
    .to(
      button.find(".folder-button-layer1 > *"),
      { y: 40, stagger: 0.2 / 3 },
      "<"
    )
    .to(
      button.find(".folder-button-layer2 > *"),
      { y: 0, stagger: 0.2 / 3 },
      "<"
    );

  return buttonTimeline;
}

function createSortButtonHoverTl(button) {
  gsap.set(button.find(".sort-button-layer2 > *"), { y: -40 });

  const tl = gsap
    .timeline({ defaults: { duration: 0.2, ease: "set1" }, paused: true })
    .to(button, { x: 10, backgroundColor: "#ea81af" })
    .fromTo(button, { scale: 1 }, { scale: 1.05 }, "<")
    .to(
      button.find(".sort-button-layer1 > *"),
      { y: 40, stagger: 0.2 / 3 },
      "<"
    )
    .to(
      button.find(".sort-button-layer2 > *"),
      { y: 0, stagger: 0.2 / 3 },
      "<"
    );

  return tl;
}

function createImageHoverTl(container) {
  const tl = gsap
    .timeline({
      defaults: { duration: 0.2, ease: "set1" },
      paused: true,
    })
    .fromTo(
      container.find("img"),
      { filter: "brightness(0.8)" },
      { filter: "brightness(1)" }
    )
    .fromTo(container, { scale: 1 }, { scale: 1.05 }, "<");

  return tl;
}

//
// 通用型
//
function createScaleTl(element, fromScale, toScale) {
  const tl = gsap
    .timeline({
      defaults: { duration: 0.2, ease: "set1" },
      paused: true,
    })
    .fromTo(element, { scale: fromScale }, { scale: toScale });

  return tl;
}

function createScaleYoyoTl(element, toScale) {
  const tl = gsap
    .timeline({
      defaults: { duration: 0.1, ease: "set1" },
      paused: true,
    })
    .to(element, { scale: toScale, repeat: 1, yoyo: true });

  return tl;
}

function createBackgroundColorTl(element, toColor, duration = 0.2) {
  const tl = gsap
    .timeline({
      defaults: { duration: duration, ease: "set1" },
      paused: true,
    })
    .to(element, { backgroundColor: toColor });

  return tl;
}

function createTranslateTl(element, toX, toY) {
  const tl = gsap
    .timeline({
      defaults: { duration: 0.2, ease: "set1" },
      paused: true,
    })
    .to(element, { x: toX, y: toY });

  return tl;
}

function createZIndexTl(element, fromZ, toZ) {
  const tl = gsap
    .timeline({
      defaults: { duration: 0.2, ease: "set1" },
      paused: true,
    })
    .fromTo(element, { zIndex: fromZ }, { zIndex: toZ });

  return tl;
}

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

function createOutlineTl(element, config) {
  // 預設配置
  const defaultConfig = {
    outlineColor: "white",
    outlineWidth: 2,
    duration: 0.2,
  };

  // 合併預設配置和用戶提供的配置
  config = { ...defaultConfig, ...config };

  // 創建所需元素
  const outline = createOutline(element, config);

  // 包含padding
  const elementtWidth = element.innerWidth();
  const elementHeight = element.innerHeight();

  // 返回時間軸
  return gsap
    .timeline({
      defaults: { duration: config.duration, ease: "set1" },
      paused: true,
    })
    .to(outline.outline1, {
      width: elementtWidth + config.outlineWidth * 2,
      height: elementHeight + config.outlineWidth * 2,
    })
    .to(
      outline.outline2,
      {
        width: elementtWidth + config.outlineWidth * 2,
        height: elementHeight + config.outlineWidth * 2,
      },
      "<"
    );
}

function createToggleTl(toggler) {
  const inner = toggler.find(".toggler-inner");
  const dot = toggler.find(".toggler-dot");

  const tl = gsap
    .timeline({ defaults: { duration: 0.2, ease: "set1" }, paused: true })
    .to(dot, { x: 25, backgroundColor: "hsl(210, 0%, 25%)" })
    .to(inner, { backgroundColor: "#ea81af" }, "<");

  return tl;
}

function createTogglerHoverTl(toggler) {
  const dot = toggler.find(".toggler-dot");

  const tl = gsap
    .timeline({ defaults: { duration: 0.2, ease: "set1" }, paused: true })
    .fromTo(toggler, { filter: "brightness(1)" }, { filter: "brightness(1.5)" })
    .to(dot, { scale: 1.1 }, "<");

  return tl;
}

function createSelectOpenTl(select) {
  const main = select.find("button").eq(0);
  const pages = select.find("button").not(main);
  const hr = select.find(".h-separator");
  const timeline = gsap
    .timeline({
      defaults: { duration: 0.2, ease: "set1" },
      paused: true,
    })
    .from(hr, { width: 0 })
    .from(pages, { ease: "back.out(2)", scale: 0.1, stagger: 0.1 }, "<")
    .from(pages, { autoAlpha: 0, stagger: 0.1 }, "<");

  return timeline;
}
