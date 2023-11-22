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
