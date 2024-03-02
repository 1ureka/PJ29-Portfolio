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
