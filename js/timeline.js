//
// 交互效果
//
function createScrollButtonHoverTl(button) {
  const tl = gsap
    .timeline({
      defaults: { duration: 0.2, ease: "set1" },
      paused: true,
    })
    .to(button.find("img")[0], { y: -40 })
    .to(button.find("img")[1], { y: 0 }, "<")
    .to(button, { backgroundColor: "#ea81af" }, "<")
    .to(button.find(".scroll-icon-container"), { scale: 1.2 }, "<");

  return tl;
}

function createScrollButtonClickTl(button) {
  const tl = gsap
    .timeline({
      defaults: { duration: 0.1, ease: "set1" },
      paused: true,
    })
    .to(button, { scale: 0.6, yoyo: true, repeat: 1 });

  return tl;
}

function createEraserIconHoverTl(iconContainer) {
  return gsap
    .timeline({
      defaults: { duration: 0.2, ease: "set1" },
      paused: true,
    })
    .to(iconContainer.find("img").eq(1), { x: -5 });
}

function createEraserIconClickTl(iconContainer) {
  return gsap
    .timeline({
      defaults: { duration: 0.1, ease: "set1" },
      paused: true,
    })
    .to(iconContainer, {
      scale: 0.7,
      yoyo: true,
      repeat: 1,
      onComplete: () => iconContainer.hide(350),
    });
}

function createSearchIconHoverTl(iconContainer) {
  const t1 = gsap
    .timeline({ defaults: { ease: "set1", duration: 0.6 }, paused: true })
    .to(iconContainer.find(".search-icon-inner"), {
      x: "+=40",
      rotate: 20,
    });
  const t2 = gsap
    .timeline({ defaults: { ease: "set1", duration: 0.3 }, paused: true })
    .to(iconContainer, {
      scale: 1.1,
      rotate: "+=15",
      transformOrigin: "16.5px 17px",
    });
  return { t1, t2 };
}

function createFolderIconHoverTl(container) {
  const front = container.find(".folder-icon-front");

  const frontTimeline = gsap
    .timeline({ defaults: { duration: 0.2, ease: "set1" }, paused: true })
    .to(front, {
      rotateY: -30,
      rotateX: 30,
      width: 38,
    });

  return frontTimeline;
}

function createFolderButtonHoverTl(button) {
  const buttonTimeline = gsap
    .timeline({ defaults: { duration: 0.2, ease: "set1" }, paused: true })
    .to(button, {
      scale: 1.05,
      height: 50,
      margin: "10px 0",
      backgroundColor: "#ea81af",
    })
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

function createFolderButtonClickTl(button) {
  const buttonTimeline = gsap
    .timeline({
      defaults: { duration: 0.1, ease: "set1" },
      paused: true,
    })
    .to(button, { scale: 0.9, yoyo: true, repeat: 1 });

  return buttonTimeline;
}

function createFolderSelectOpenTl(select) {
  const main = select.find(".folder-button").eq(0);
  const pages = select.find(".folder-button").not(main);
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

//
// 過場
//
