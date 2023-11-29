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

function createFolderButtonClickTl(button) {
  const buttonTimeline = gsap
    .timeline({
      defaults: { duration: 0.1, ease: "set1" },
      paused: true,
    })
    .to(button, { scale: 0.9, yoyo: true, repeat: 1 });

  return buttonTimeline;
}

function createSortImgHoverTl(container) {
  const hover1 = gsap
    .timeline({ defaults: { duration: 0.35, ease: "set1" }, paused: true })
    .to(container.children().slice(4), { y: "-=40", delay: 0.1 });

  const hover2 = gsap
    .timeline({ defaults: { duration: 0.35 }, paused: true })
    .to(container.children().slice(0, 4), {
      scale: 0.25,
      rotate: 15,
      stagger: { each: -0.1, yoyo: true, repeat: 1 },
      ease: "back.in(4)",
    });

  const hover3 = gsap
    .timeline({ defaults: { duration: 0.2, ease: "set1" }, paused: true })
    .to(container, { scale: 1.25 });

  return [hover1, hover2, hover3];
}

function createSortIconHoverTl(container) {
  const tl = gsap
    .timeline({ defaults: { duration: 0.2, ease: "set1" }, paused: true })
    .to(container.find(".sort-img-container").eq(0), { autoAlpha: 0 })
    .to(container.find(".sort-img-container").eq(1), { autoAlpha: 1 }, "<");

  return tl;
}

function createFullscreenIconHoverTl(container) {
  const img1 = container.find("img").slice(0, 4);
  const img2 = container.find("img").slice(4);
  gsap.set(img2, { autoAlpha: 0, scale: 0.5 });
  const tl = gsap
    .timeline({
      defaults: { duration: 0.15, ease: "back.out(4)", stagger: 0.05 },
      paused: true,
    })
    .to(img1, { autoAlpha: 0, scale: 0.5, ease: "back.in(3)" })
    .to(img2, { autoAlpha: 1, scale: 1 });

  return tl;
}

function createSortButtonHoverTl(button) {
  const buttonTimeline = gsap
    .timeline({ defaults: { duration: 0.2, ease: "set1" }, paused: true })
    .to(button, { x: 10, backgroundColor: "#ea81af" })
    .fromTo(button, { scale: 1 }, { scale: 1.05 }, "<");

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

function createBulbLightTl(bulbContainer, config) {
  // 預設配置
  const defaultConfig = {
    color: "#8ce197",
    intensity: 1,
    yoyo: false,
  };

  // 合併預設配置和用戶提供的配置
  config = { ...defaultConfig, ...config };

  const tl = gsap
    .timeline({
      defaults: { duration: config.yoyo ? 0.1 : 0.2, ease: "set1" },
      paused: true,
    })
    .to(bulbContainer.find(".bulb"), {
      backgroundColor: config.color,
      boxShadow: `0 0 20px ${(config.intensity - 1) * 10}px ${config.color}`,
      yoyo: config.yoyo,
      repeat: config.yoyo ? 1 : 0,
    })
    .to(bulbContainer.find(".bulb-filter"), { filter: "blur(3px)" }, "<");

  return tl;
}

function createBulbLightT2(bulbContainer, config) {
  // 預設配置
  const defaultConfig = {
    color: "#8ce197",
    intensity: 1,
  };

  // 合併預設配置和用戶提供的配置
  config = { ...defaultConfig, ...config };

  const tl = gsap
    .timeline({
      defaults: { duration: 0.2, ease: "set1" },
      paused: true,
    })
    .to(bulbContainer.find(".bulb"), { backgroundColor: config.color }, "<")
    .to(bulbContainer.find(".bulb-filter"), { filter: "blur(3px)" }, "<")
    .to(
      bulbContainer.find(".bulb"),
      {
        boxShadow: `0 0 20px ${config.intensity * 5}px ${config.color}`,
      },
      "<"
    )
    .to(bulbContainer.find(".bulb"), {
      boxShadow: `0 0 20px 0px ${config.color}`,
    });

  return tl;
}

function createFolderBoxHoverTl(box) {
  const tl = gsap
    .timeline({
      defaults: { duration: 0.2, ease: "set1" },
      paused: true,
    })
    .fromTo(box, { minWidth: "100%" }, { minWidth: "105%" });

  return tl;
}

function createFolderBoxClickTl(box) {
  const tl = gsap
    .timeline({
      defaults: { duration: 0.1, ease: "set1" },
      paused: true,
    })
    .to(box, { scale: 0.9, repeat: 1, yoyo: true });

  return tl;
}

function createFolderBoxContainerHoverTl(container) {
  const tl = gsap
    .timeline({
      defaults: { duration: 0.2, ease: "set1" },
      paused: true,
    })
    .from(container.find(".folder-box-img"), {
      y: 0,
      autoAlpha: 0,
      stagger: 0.1,
    });

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

function createImageClickTl(container) {
  const tl = gsap
    .timeline({
      defaults: { duration: 0.1, ease: "set1" },
      paused: true,
    })
    .to(container, { scale: 0.9, repeat: 1, yoyo: true });

  return tl;
}

//
// 通用型
//
function createScaleClickTl(element, toScale) {
  const tl = gsap
    .timeline({
      defaults: { duration: 0.1, ease: "set1" },
      paused: true,
    })
    .to(element, { scale: toScale, repeat: 1, yoyo: true });

  return tl;
}

function createScaleHoverTl(element, fromScale, toScale) {
  const tl = gsap
    .timeline({
      defaults: { duration: 0.2, ease: "set1" },
      paused: true,
    })
    .fromTo(element, { scale: fromScale }, { scale: toScale });

  return tl;
}

function createColorHoverTl(element, toColor, duration = 0.2) {
  const tl = gsap
    .timeline({
      defaults: { duration: duration, ease: "set1" },
      paused: true,
    })
    .to(element, { backgroundColor: toColor });

  return tl;
}
