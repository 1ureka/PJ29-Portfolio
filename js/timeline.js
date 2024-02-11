//
// 自定義型
//

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
