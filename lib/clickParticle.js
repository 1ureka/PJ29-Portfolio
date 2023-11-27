$(document).ready(function () {
  const particleContainer = $("#particle-container");

  function createParticle(x, y) {
    const particle = $("<div class='particle'></div>");
    particleContainer.append(particle);

    particle.css({
      left: x,
      top: y,
    });

    return particle;
  }

  function animateParticle(particle) {
    const tl = gsap.timeline();

    tl.to(particle, {
      duration: 1,
      autoAlpha: 0,
      scale: 0.2,
      ease: "power2.Out",
      onComplete: () => particle.remove(),
    }).to(
      particle,
      {
        duration: 0.1,
        backgroundColor: "#ea81af",
        ease: "power2.Out",
      },
      "<0.15"
    );

    return tl;
  }

  function getRandomValue(minimum, maximum, snapIncrement, returnFunction) {
    if (returnFunction) {
      return gsap.utils.random(minimum, maximum, snapIncrement, true);
    } else {
      return gsap.utils.random(minimum, maximum, snapIncrement);
    }
  }

  function startAnimation(x, y) {
    for (let i = 0; i < 15; i++) {
      const particle = createParticle(x, y);
      const tl = animateParticle(particle);

      const angle = getRandomValue(0, Math.PI * 2);
      const distance = getRandomValue(0, 150);

      gsap.to(particle, {
        duration: 1,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        ease: "power2.Out",
      });
    }
  }
  $(document).click(function (e) {
    startAnimation(e.clientX, e.clientY);
  });
});
